import { Octokit } from "@octokit/rest";
import type { FileTreeItem, RepoMetadata, KeyFilesResult } from "@/types/github";

function getOctokit(): Octokit {
  const token = process.env.GITHUB_TOKEN;
  if (!token || token === "your_github_personal_access_token") {
    return new Octokit();
  }
  return new Octokit({ auth: token });
}

export async function getRepoMetadata(
  owner: string,
  repo: string
): Promise<RepoMetadata> {
  const octokit = getOctokit();
  const { data } = await octokit.rest.repos.get({ owner, repo });

  return {
    name: data.name,
    fullName: data.full_name,
    description: data.description,
    stars: data.stargazers_count ?? 0,
    language: data.language,
    topics: data.topics ?? [],
    defaultBranch: data.default_branch,
    lastCommitSha: data.pushed_at ?? null,
  };
}

export async function getFileTree(
  owner: string,
  repo: string,
  branch?: string
): Promise<FileTreeItem[]> {
  const octokit = getOctokit();

  if (!branch) {
    const meta = await getRepoMetadata(owner, repo);
    branch = meta.defaultBranch;
  }

  const { data } = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: branch,
    recursive: "1",
  });

  return (data.tree as FileTreeItem[]).filter(
    (item): item is FileTreeItem => item.path !== undefined
  );
}

export async function getFileContent(
  owner: string,
  repo: string,
  path: string
): Promise<string | null> {
  try {
    const octokit = getOctokit();
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    if ("content" in data && typeof data.content === "string") {
      return Buffer.from(data.content, "base64").toString("utf-8");
    }

    return null;
  } catch {
    return null;
  }
}

export function detectKeyFiles(tree: FileTreeItem[]): KeyFilesResult {
  const paths = tree.map((item) => item.path.toLowerCase());

  const find = (name: string): string | null => {
    const match = tree.find(
      (item) => item.path.toLowerCase() === name.toLowerCase()
    );
    return match?.path ?? null;
  };

  return {
    readme: find("README.md"),
    packageJson: find("package.json"),
    requirementsTxt: find("requirements.txt"),
    cargoToml: find("Cargo.toml"),
    goMod: find("go.mod"),
    pomXml: find("pom.xml"),
    envExample: find(".env.example"),
    dockerCompose: find("docker-compose.yml") ?? find("docker-compose.yaml"),
  };
}
