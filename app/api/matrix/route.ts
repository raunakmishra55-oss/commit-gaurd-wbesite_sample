import { listPRs, getPRFiles } from "@/lib/github";
import { computeEffort, computeImpact } from "@/lib/impact";
import type { MatrixPoint } from "@/types";

export async function GET() {
  try {
    const prs = await listPRs("all");

    const points: MatrixPoint[] = await Promise.all(
      prs.slice(0, 30).map(async (pr) => {
        let filenames: string[] = [];
        try {
          const files = await getPRFiles(pr.number);
          filenames = files.map((f) => f.filename);
        } catch {
          // Some PRs might not have file data
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const prAny = pr as any;
        const additions = prAny.additions ?? 0;
        const deletions = prAny.deletions ?? 0;

        return {
          prNumber: pr.number,
          title: pr.title,
          effort: computeEffort(additions, deletions),
          impact: computeImpact(filenames),
          additions,
          deletions,
          files: filenames,
          state: pr.merged_at ? "merged" : pr.state,
          user: pr.user?.login ?? "unknown",
        };
      })
    );

    return Response.json(points);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
