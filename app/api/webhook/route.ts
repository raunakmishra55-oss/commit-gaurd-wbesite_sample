import { NextRequest } from "next/server";
import crypto from "crypto";
import type { WebhookEvent } from "@/types";

// In-memory store for received events (replace with DB in production)
const eventLog: WebhookEvent[] = [];

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const digest = `sha256=${hmac.digest("hex")}`;
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!secret) {
    return Response.json(
      { error: "GITHUB_WEBHOOK_SECRET not configured" },
      { status: 500 }
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256") ?? "";
  const event = request.headers.get("x-github-event") ?? "unknown";
  const deliveryId = request.headers.get("x-github-delivery") ?? "none";

  // Verify HMAC signature
  if (!verifySignature(rawBody, signature, secret)) {
    console.warn(`[Webhook] Invalid signature for delivery ${deliveryId}`);
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  console.log(`[Webhook] Received event: ${event} | Delivery: ${deliveryId}`);

  // Handle pull_request events
  if (event === "pull_request") {
    const action = String(payload.action ?? "unknown");
    const pr = payload.pull_request as Record<string, unknown>;
    const prNumber = Number((pr?.number as number) ?? 0);
    const prTitle = String(pr?.title ?? "");
    const senderLogin = String(
      (payload.sender as Record<string, unknown>)?.login ?? "unknown"
    );
    const repoName = String(
      ((payload.repository as Record<string, unknown>)?.full_name as string) ?? ""
    );

    const entry: WebhookEvent = {
      action,
      pr_number: prNumber,
      title: prTitle,
      sender: senderLogin,
      repo: repoName,
      received_at: new Date().toISOString(),
    };

    eventLog.unshift(entry);
    if (eventLog.length > 100) eventLog.pop(); // cap at 100

    console.log(`[Webhook] PR #${prNumber} (${action}) by ${senderLogin} in ${repoName}`);

    return Response.json({
      received: true,
      event,
      action,
      pr_number: prNumber,
      delivery_id: deliveryId,
    });
  }

  // Acknowledge other events
  return Response.json({ received: true, event, action: "ignored" });
}

// GET — return recent event log (for dashboard display)
export async function GET() {
  return Response.json(eventLog);
}
