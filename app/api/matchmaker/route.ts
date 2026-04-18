import { NextRequest } from "next/server";
import { getPRFiles, getFileCommits, getPR } from "@/lib/github";
import type { ContributorStat, MatchmakerResult } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prParam = searchParams.get("pr");

    if (!prParam) {
      return Response.json({ error: "Missing ?pr=<number> query param" }, { status: 400 });
    }

    const prNumber = parseInt(prParam, 10);
    if (isNaN(prNumber)) {
      return Response.json({ error: "Invalid PR number" }, { status: 400 });
    }

    const [pr, files] = await Promise.all([getPR(prNumber), getPRFiles(prNumber)]);

    // Overall top contributor across all files (deduplicated by commit SHA)
    const overallShas = new Map<string, Set<string>>(); // login -> Set<sha>
    const overallMap = new Map<string, ContributorStat>();

    // Fetch commit history for each changed file in parallel
    const fileContributors = await Promise.all(
      files.slice(0, 15).map(async (file) => {
        const commits = await getFileCommits(file.filename);

        // Tally commits per contributor
        const statsMap = new Map<string, ContributorStat>();
        for (const commit of commits) {
          const login = commit.author?.login ?? commit.commit.author?.name ?? "unknown";
          const avatar = commit.author?.avatar_url ?? "";
          const html_url = commit.author?.html_url ?? "";
          const sha = commit.sha;

          // Per-file stats
          if (statsMap.has(login)) {
            statsMap.get(login)!.commits += 1;
            if (!statsMap.get(login)!.files.includes(file.filename)) {
               statsMap.get(login)!.files.push(file.filename);
            }
          } else {
            statsMap.set(login, {
              login,
              avatar_url: avatar,
              html_url,
              commits: 1,
              files: [file.filename],
            });
          }

          // Global stats tracking avoiding double-counting
          if (!overallShas.has(login)) overallShas.set(login, new Set());
          const userSet = overallShas.get(login)!;

          if (!overallMap.has(login)) {
            overallMap.set(login, {
              login, avatar_url: avatar, html_url, commits: 0, files: []
            });
          }
          const overallStat = overallMap.get(login)!;

          if (!userSet.has(sha)) {
            userSet.add(sha);
            overallStat.commits = userSet.size;
          }
          if (!overallStat.files.includes(file.filename)) {
            overallStat.files.push(file.filename);
          }
        }

        const topContributors = Array.from(statsMap.values())
          .sort((a, b) => b.commits - a.commits)
          .slice(0, 5);

        return {
          filename: file.filename,
          topContributors,
        };
      })
    );

    const overallTop = Array.from(overallMap.values()).sort((a, b) => b.commits - a.commits)[0] ?? null;

    const result: MatchmakerResult = {
      prNumber,
      title: pr.title,
      files: fileContributors,
      overallTop,
    };

    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
