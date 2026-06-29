import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getRepoMetadata, getFileTree, getFileContent, detectKeyFiles } from "@/lib/github";
import { analyzeRepo } from "@/lib/analyzer";
import type { AnalysisResult, RepoDataInput } from "@/types/analysis";

const prisma = new PrismaClient();

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const cleaned = url.trim().replace(/\.git$/, "").replace(/\/$/, "");

  const fullMatch = cleaned.match(
    /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/\s]+)\/([^/\s]+)$/
  );
  if (fullMatch) {
    return { owner: fullMatch[1], repo: fullMatch[2] };
  }

  const shortMatch = cleaned.match(/^([^/\s]+)\/([^/\s]+)$/);
  if (shortMatch) {
    return { owner: shortMatch[1], repo: shortMatch[2] };
  }

  return null;
}

function reconstructAnalysis(record: {
  summary: string;
  techStack: unknown;
  folderTree: unknown;
  architecture: unknown;
  setupSteps: unknown;
}): AnalysisResult {
  const arch = record.architecture as {
    purpose?: string;
    entryPoint?: { file: string; explanation: string };
    dataFlow?: string;
    highlights?: string[];
  } | null;

  return {
    summary: record.summary,
    purpose: arch?.purpose ?? "",
    techStack: (record.techStack as AnalysisResult["techStack"]) ?? [],
    folders: (record.folderTree as AnalysisResult["folders"]) ?? [],
    entryPoint: arch?.entryPoint ?? { file: "", explanation: "" },
    dataFlow: arch?.dataFlow ?? "",
    setupSteps: (record.setupSteps as string[]) ?? [],
    highlights: arch?.highlights ?? [],
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const repoUrl: string = body?.repoUrl;

    if (!repoUrl || typeof repoUrl !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'repoUrl' in request body" },
        { status: 400 }
      );
    }

    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid GitHub URL. Use format: https://github.com/owner/repo" },
        { status: 400 }
      );
    }

    const { owner, repo } = parsed;

    const normalizedUrl = `https://github.com/${owner}/${repo}`;
    const existing = await prisma.repoAnalysis.findUnique({
      where: { repoUrl: normalizedUrl },
    });

    let metadata: Awaited<ReturnType<typeof getRepoMetadata>>;
    try {
      metadata = await getRepoMetadata(owner, repo);
    } catch (err: unknown) {
      const status =
        err && typeof err === "object" && "status" in err
          ? (err as { status: number }).status
          : 500;

      if (status === 404) {
        return NextResponse.json(
          { error: `Repository "${owner}/${repo}" not found. Check the URL and make sure the repo exists and is not private.` },
          { status: 404 }
        );
      }
      if (status === 403) {
        return NextResponse.json(
          { error: "API rate limit exceeded. Add a GITHUB_TOKEN to increase limits, or try again later." },
          { status: 403 }
        );
      }
      throw err;
    }

    if (existing) {
      const age = Date.now() - new Date(existing.createdAt).getTime();
      const isFresh = age < 24 * 60 * 60 * 1000;
      const shaMatch = existing.lastCommitSha === metadata.lastCommitSha;

      if (isFresh && shaMatch) {
        return NextResponse.json({
          cached: true,
          analysis: reconstructAnalysis(existing),
        });
      }
    }

    const tree = await getFileTree(owner, repo, metadata.defaultBranch);
    const keyFiles = detectKeyFiles(tree);

    const fileContents: Record<string, string | null> = {};
    for (const [key, filePath] of Object.entries(keyFiles)) {
      if (filePath) {
        fileContents[key] = await getFileContent(owner, repo, filePath);
      } else {
        fileContents[key] = null;
      }
    }

    const repoData: RepoDataInput = {
      metadata,
      fileTree: tree.map((item) => ({
        path: item.path,
        type: item.type,
      })),
      files: fileContents,
    };

    const analysis = await analyzeRepo(repoData);

    const updated = await prisma.repoAnalysis.upsert({
      where: { repoUrl: normalizedUrl },
      update: {
        summary: analysis.summary,
        techStack: JSON.parse(JSON.stringify(analysis.techStack)),
        folderTree: JSON.parse(JSON.stringify(analysis.folders)),
        architecture: JSON.parse(
          JSON.stringify({
            purpose: analysis.purpose,
            entryPoint: analysis.entryPoint,
            dataFlow: analysis.dataFlow,
            highlights: analysis.highlights,
          })
        ),
        setupSteps: JSON.parse(JSON.stringify(analysis.setupSteps)),
        rawFileTree: JSON.parse(JSON.stringify(tree)),
        lastCommitSha: metadata.lastCommitSha ?? "",
      },
      create: {
        repoUrl: normalizedUrl,
        owner,
        repoName: repo,
        summary: analysis.summary,
        techStack: JSON.parse(JSON.stringify(analysis.techStack)),
        folderTree: JSON.parse(JSON.stringify(analysis.folders)),
        architecture: JSON.parse(
          JSON.stringify({
            purpose: analysis.purpose,
            entryPoint: analysis.entryPoint,
            dataFlow: analysis.dataFlow,
            highlights: analysis.highlights,
          })
        ),
        setupSteps: JSON.parse(JSON.stringify(analysis.setupSteps)),
        rawFileTree: JSON.parse(JSON.stringify(tree)),
        lastCommitSha: metadata.lastCommitSha ?? "",
      },
    });

    return NextResponse.json({
      cached: false,
      analysis: reconstructAnalysis(updated),
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    console.error("Analyze route error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
