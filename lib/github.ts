import { Octokit } from "@octokit/rest";

let octokitInstance: Octokit | null = null;

export function getOctokit(): Octokit {
  if (!octokitInstance) {
    octokitInstance = new Octokit({
      auth: process.env.GITHUB_TOKEN,
      userAgent: "CommitGuard/1.0",
    });
  }
  return octokitInstance;
}

export function getRepoConfig() {
  const owner = process.env.NEXT_PUBLIC_GITHUB_OWNER;
  const repo = process.env.NEXT_PUBLIC_GITHUB_REPO;
  if (!owner || !repo) {
    throw new Error(
      "Missing NEXT_PUBLIC_GITHUB_OWNER or NEXT_PUBLIC_GITHUB_REPO env vars"
    );
  }
  return { owner, repo };
}

export async function listPRs(state: "open" | "closed" | "all" = "all") {
  const octokit = getOctokit();
  const { owner, repo } = getRepoConfig();
  const { data } = await octokit.pulls.list({
    owner,
    repo,
    state,
    per_page: 50,
    sort: "updated",
    direction: "desc",
  });
  return data;
}

export async function getPR(prNumber: number) {
  const octokit = getOctokit();
  const { owner, repo } = getRepoConfig();
  const { data } = await octokit.pulls.get({ owner, repo, pull_number: prNumber });
  return data;
}

export async function getPRFiles(prNumber: number) {
  const octokit = getOctokit();
  const { owner, repo } = getRepoConfig();
  const { data } = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number: prNumber,
    per_page: 100,
  });
  return data;
}

export async function getPRDiff(prNumber: number): Promise<string> {
  const octokit = getOctokit();
  const { owner, repo } = getRepoConfig();
  const response = await octokit.request(
    "GET /repos/{owner}/{repo}/pulls/{pull_number}",
    {
      owner,
      repo,
      pull_number: prNumber,
      headers: { accept: "application/vnd.github.diff" },
    }
  );
  return response.data as unknown as string;
}

export async function getFileCommits(filename: string) {
  const octokit = getOctokit();
  const { owner, repo } = getRepoConfig();
  const { data } = await octokit.repos.listCommits({
    owner,
    repo,
    path: filename,
    per_page: 100,
  });
  return data;
}
