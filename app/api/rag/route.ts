import { NextRequest } from "next/server";
import { embedDocument, queryDocuments, CHROMA_STATUS } from "@/lib/chroma";

export async function GET() {
  return Response.json({
    status: CHROMA_STATUS,
    endpoints: {
      embed: "POST /api/rag { text, metadata }",
      query: "POST /api/rag { query, topK? }",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, text, query, metadata, topK } = body;

    if (action === "embed") {
      if (!text) {
        return Response.json({ error: "Missing 'text' field" }, { status: 400 });
      }
      const id = `doc-${Date.now()}`;
      const result = await embedDocument(id, text, metadata ?? {});
      return Response.json({ success: true, id: result.id, embeddingDim: result.dim });
    }

    if (action === "query") {
      if (!query) {
        return Response.json({ error: "Missing 'query' field" }, { status: 400 });
      }
      const results = await queryDocuments(query, topK ?? 5);
      return Response.json({ results });
    }

    return Response.json({ error: "Invalid action. Use 'embed' or 'query'" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
