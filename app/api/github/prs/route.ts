import { NextRequest } from "next/server";
import { listPRs } from "@/lib/github";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = (searchParams.get("state") || "all") as "open" | "closed" | "all";

    const prs = await listPRs(state);

    // Map to a lean shape for the client
    // Note: pulls.list returns a subset type; some fields like additions/deletions
    // are only available on individual PR fetches. We use safe access with defaults.
    const mapped = prs.map((pr) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prAny = pr as any;
      return {
        id: pr.id,
        number: pr.number,
        title: pr.title,
        state: pr.merged_at ? "merged" : pr.state,
        user: {
          login: pr.user?.login ?? "unknown",
          avatar_url: pr.user?.avatar_url ?? "",
          html_url: pr.user?.html_url ?? "",
        },
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        merged_at: pr.merged_at ?? null,
        closed_at: pr.closed_at ?? null,
        html_url: pr.html_url,
        body: pr.body ?? null,
        draft: pr.draft ?? false,
        labels: pr.labels.map((l) => ({
          name: l.name ?? "",
          color: l.color ?? "808080",
        })),
        additions: prAny.additions ?? 0,
        deletions: prAny.deletions ?? 0,
        changed_files: prAny.changed_files ?? 0,
        base: { ref: pr.base.ref },
        head: { ref: pr.head.ref, sha: pr.head.sha },
      };
    });

    return Response.json(mapped);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
