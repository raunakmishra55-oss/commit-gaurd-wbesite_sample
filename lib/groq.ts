import Groq from "groq-sdk";

let groqInstance: Groq | null = null;

export function getGroq(): Groq {
  if (!groqInstance) {
    groqInstance = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groqInstance;
}

export async function summarizeDiff(
  prTitle: string,
  diff: string
): Promise<{ summary: string; model: string; tokensUsed?: number }> {
  const groq = getGroq();

  // Truncate diff to avoid token limits (roughly 12k chars ≈ 3k tokens)
  const truncatedDiff = diff.length > 12000 ? diff.slice(0, 12000) + "\n...[truncated]" : diff;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are a senior software engineer reviewing pull requests.
Summarize the PR diff in clear, plain English for a non-technical stakeholder.
Structure your response as:
**What changed**: (1-2 sentences)
**Why it matters**: (1 sentence about impact)
**Key files**: (bullet list of most important changed files)
**Risk level**: (Low / Medium / High with brief reason)
Be concise. Avoid jargon.`,
      },
      {
        role: "user",
        content: `PR Title: "${prTitle}"\n\nDiff:\n\`\`\`diff\n${truncatedDiff}\n\`\`\``,
      },
    ],
    temperature: 0.3,
    max_tokens: 512,
  });

  const message = completion.choices[0]?.message?.content ?? "No summary generated.";
  return {
    summary: message,
    model: completion.model,
    tokensUsed: completion.usage?.total_tokens,
  };
}
