import Groq from "groq-sdk";
import type { AnalysisResult, RepoDataInput } from "@/types/analysis";

function getClient(): Groq {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error("GROQ_API_KEY is not configured");
  }
  return new Groq({ apiKey: key });
}

function buildPrompt(data: RepoDataInput): string {
  const treeSummary = data.fileTree
    .filter((f) => f.type === "blob")
    .map((f) => f.path)
    .join("\n");

  const fileContents = Object.entries(data.files)
    .filter(([_, content]) => content !== null)
    .map(([name, content]) => `--- ${name} ---\n${content}`)
    .join("\n\n");

  return `You are analyzing a GitHub repository. Return ONLY valid JSON with no markdown, no code fences, no extra text.

Repository: ${data.metadata.fullName}
Description: ${data.metadata.description ?? "N/A"}
Language: ${data.metadata.language ?? "N/A"}
Topics: ${data.metadata.topics.join(", ") || "N/A"}
Stars: ${data.metadata.stars}

File tree:
${treeSummary || "(empty)"}

Key file contents:
${fileContents || "(none)"}

Respond with this exact JSON structure (no trailing commas):
{
  "summary": "2-3 sentence overview of what the project does",
  "purpose": "one-line purpose statement",
  "techStack": [
    { "name": "Technology name", "category": "frontend|backend|database|devops|testing", "icon": "simple-icon-identifier" }
  ],
  "folders": [
    { "name": "folder name", "path": "relative/path", "explanation": "what this folder contains and its role" }
  ],
  "entryPoint": { "file": "path/to/entry", "explanation": "why this is the entry point" },
  "dataFlow": "explain how data moves through the application",
  "setupSteps": ["step 1", "step 2", "..."],
  "highlights": ["3-5 notable things about this codebase"]
}

For "icon" in techStack, use lowercase simple identifiers like "react", "nextjs", "tailwind", "nodejs", "python", "typescript", "postgresql", "docker", etc.
For "folders", include only the top-level directories that contain source code (e.g. src/, app/, components/, lib/, etc.). Skip config folders, node_modules, build output.
Be specific and accurate. Use the actual file contents to inform your analysis.`;
}

export async function analyzeRepo(data: RepoDataInput): Promise<AnalysisResult> {
  const client = getClient();
  const prompt = buildPrompt(data);

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from AI");
  }

  try {
    const parsed = JSON.parse(content) as AnalysisResult;
    validateResult(parsed);
    return parsed;
  } catch (err) {
    throw new Error(
      `Failed to parse AI response: ${err instanceof Error ? err.message : "unknown error"}`
    );
  }
}

function validateResult(result: unknown): asserts result is AnalysisResult {
  const r = result as Record<string, unknown>;
  if (typeof r.summary !== "string") throw new Error("Missing or invalid 'summary'");
  if (typeof r.purpose !== "string") throw new Error("Missing or invalid 'purpose'");
  if (!Array.isArray(r.techStack)) throw new Error("Missing or invalid 'techStack'");
  if (!Array.isArray(r.folders)) throw new Error("Missing or invalid 'folders'");
  if (!r.entryPoint || typeof r.entryPoint !== "object") throw new Error("Missing or invalid 'entryPoint'");
  if (typeof r.dataFlow !== "string") throw new Error("Missing or invalid 'dataFlow'");
  if (!Array.isArray(r.setupSteps)) throw new Error("Missing or invalid 'setupSteps'");
  if (!Array.isArray(r.highlights)) throw new Error("Missing or invalid 'highlights'");
}
