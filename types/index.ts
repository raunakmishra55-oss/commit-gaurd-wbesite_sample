export interface PullRequest {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed" | "merged";
  user: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  closed_at: string | null;
  html_url: string;
  body: string | null;
  draft: boolean;
  labels: { name: string; color: string }[];
  additions: number;
  deletions: number;
  changed_files: number;
  base: { ref: string };
  head: { ref: string; sha: string };
}

export interface FileChange {
  filename: string;
  additions: number;
  deletions: number;
  changes: number;
  status: string;
  patch?: string;
  blob_url: string;
  raw_url: string;
}

export interface MatrixPoint {
  prNumber: number;
  title: string;
  effort: number;       // 0–100, based on LOC changed
  impact: number;       // 0–100, based on file paths
  additions: number;
  deletions: number;
  files: string[];
  state: string;
  user: string;
}

export interface ContributorStat {
  login: string;
  avatar_url: string;
  html_url: string;
  commits: number;
  files: string[];
}

export interface MatchmakerResult {
  prNumber: number;
  title: string;
  files: {
    filename: string;
    topContributors: ContributorStat[];
  }[];
  overallTop: ContributorStat | null;
}

export interface SummarizeResult {
  prNumber: number;
  title: string;
  summary: string;
  model: string;
  tokensUsed?: number;
}

export interface WebhookEvent {
  action: string;
  pr_number: number;
  title: string;
  sender: string;
  repo: string;
  received_at: string;
}

export interface RagQueryResult {
  id: string;
  document: string;
  score: number;
  metadata: Record<string, unknown>;
}

export type ImpactLevel = "critical" | "high" | "medium" | "low";
