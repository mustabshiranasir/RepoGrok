export interface FileTreeItem {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size: number | null;
  url: string;
}

export interface RepoMetadata {
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  language: string | null;
  topics: string[];
  defaultBranch: string;
  lastCommitSha: string | null;
}

export interface KeyFilesResult {
  readme: string | null;
  packageJson: string | null;
  requirementsTxt: string | null;
  cargoToml: string | null;
  goMod: string | null;
  pomXml: string | null;
  envExample: string | null;
  dockerCompose: string | null;
}
