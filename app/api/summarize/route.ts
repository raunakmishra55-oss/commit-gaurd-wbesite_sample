import { NextRequest } from "next/server";
import { getPR, getPRDiff } from "@/lib/github";
import { summarizeDiff } from "@/lib/groq";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prNumber } = body;

    if (typeof prNumber !== "number") {
      return Response.json({ error: "Missing or invalid prNumber in body" }, { status: 400 });
    }

    const [pr, diff] = await Promise.all([getPR(prNumber), getPRDiff(prNumber)]);

    if (!diff || diff.length < 10) {
      return Response.json({
        prNumber,
        title: pr.title,
        summary: "This PR has no diff content to summarize.",
        model: "none",
      });
    }

    const { summary, model, tokensUsed } = await summarizeDiff(pr.title, diff);

    return Response.json({
      prNumber,
      title: pr.title,
      summary,
      model,
      tokensUsed,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
