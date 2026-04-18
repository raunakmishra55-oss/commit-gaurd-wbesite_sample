import { NextRequest } from "next/server";
import { getPR, getPRFiles } from "@/lib/github";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  try {
    const { number } = await params;
    const prNumber = parseInt(number, 10);

    if (isNaN(prNumber)) {
      return Response.json({ error: "Invalid PR number" }, { status: 400 });
    }

    const [pr, files] = await Promise.all([getPR(prNumber), getPRFiles(prNumber)]);

    return Response.json({
      pr: {
        id: pr.id,
        number: pr.number,
        title: pr.title,
        state: pr.merged_at ? "merged" : pr.state,
        body: pr.body,
        html_url: pr.html_url,
        user: { login: pr.user?.login, avatar_url: pr.user?.avatar_url },
        created_at: pr.created_at,
        additions: pr.additions,
        deletions: pr.deletions,
        changed_files: pr.changed_files,
        base: { ref: pr.base.ref },
        head: { ref: pr.head.ref },
      },
      files: files.map((f) => ({
        filename: f.filename,
        additions: f.additions,
        deletions: f.deletions,
        changes: f.changes,
        status: f.status,
        patch: f.patch,
        blob_url: f.blob_url,
        raw_url: f.raw_url,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
