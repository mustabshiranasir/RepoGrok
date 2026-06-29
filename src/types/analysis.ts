export interface TechStackItem {
  name: string;
  category: "frontend" | "backend" | "database" | "devops" | "testing";
  icon: string;
}

export interface FolderInfo {
  name: string;
  path: string;
  explanation: string;
}

export interface EntryPoint {
  file: string;
  explanation: string;
}

export interface AnalysisResult {
  summary: string;
  purpose: string;
  techStack: TechStackItem[];
  folders: FolderInfo[];
  entryPoint: EntryPoint;
  dataFlow: string;
  setupSteps: string[];
  highlights: string[];
}

export interface RepoDataInput {
  metadata: {
    name: string;
    fullName: string;
    description: string | null;
    stars: number;
    language: string | null;
    topics: string[];
    defaultBranch: string;
  };
  fileTree: { path: string; type: "blob" | "tree" }[];
  files: Record<string, string | null>;
}
