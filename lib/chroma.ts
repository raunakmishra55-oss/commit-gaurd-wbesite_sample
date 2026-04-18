/**
 * ChromaDB Placeholder Service
 *
 * This is a RAG-ready stub. In production, replace this with the
 * official chromadb npm client: `npm install chromadb`
 *
 * ChromaDB REST API runs locally at http://localhost:8000
 * (or in Docker: docker run -p 8000:8000 chromadb/chroma)
 *
 * Schema used here would map to a "commit-guard" collection where
 * each document is a PR file's code diff, with metadata:
 *   { prNumber, filename, author, createdAt }
 */

export interface EmbedResult {
  id: string;
  text: string;
  metadata: Record<string, unknown>;
  embedding: number[]; // mock — real embeddings need an embedding model
}

export interface QueryResult {
  id: string;
  document: string;
  score: number;
  metadata: Record<string, unknown>;
}

const MOCK_COLLECTION = "commit-guard-code";

/**
 * Embed a code snippet into ChromaDB (placeholder)
 */
export async function embedDocument(
  id: string,
  text: string,
  metadata: Record<string, unknown>
): Promise<EmbedResult> {
  // TODO: Replace with:
  //   const client = new ChromaClient({ path: "http://localhost:8000" });
  //   const collection = await client.getOrCreateCollection({ name: MOCK_COLLECTION });
  //   await collection.add({ ids: [id], documents: [text], metadatas: [metadata] });

  console.log(`[ChromaDB Placeholder] Would embed doc "${id}" into "${MOCK_COLLECTION}"`);

  // Return a mock embedding (dimension 384 matches sentence-transformers/all-MiniLM-L6-v2)
  const mockEmbedding = Array.from({ length: 384 }, () => Math.random() * 2 - 1);

  return {
    id,
    text,
    metadata,
    embedding: mockEmbedding,
  };
}

/**
 * Query ChromaDB for similar code (placeholder)
 */
export async function queryDocuments(
  queryText: string,
  topK: number = 5
): Promise<QueryResult[]> {
  // TODO: Replace with:
  //   const client = new ChromaClient({ path: "http://localhost:8000" });
  //   const collection = await client.getOrCreateCollection({ name: MOCK_COLLECTION });
  //   const results = await collection.query({ queryTexts: [queryText], nResults: topK });

  console.log(`[ChromaDB Placeholder] Would query "${MOCK_COLLECTION}" for: "${queryText}"`);

  // Return mock results that simulate what ChromaDB would return
  const mockResults: QueryResult[] = [
    {
      id: "mock-pr-42-auth-middleware",
      document: "// Authentication middleware\nexport function withAuth(handler) {\n  return async (req, res) => {\n    const token = req.headers.authorization?.split(' ')[1];\n    if (!token) return res.status(401).json({ error: 'Unauthorized' });\n    // ... verify token\n  };\n}",
      score: 0.92,
      metadata: { prNumber: 42, filename: "middleware/auth.ts", author: "alice" },
    },
    {
      id: "mock-pr-38-api-handler",
      document: "export async function GET(request: Request) {\n  const data = await fetchData();\n  return Response.json(data);\n}",
      score: 0.78,
      metadata: { prNumber: 38, filename: "app/api/data/route.ts", author: "bob" },
    },
    {
      id: "mock-pr-35-db-schema",
      document: "model User {\n  id        Int      @id @default(autoincrement())\n  email     String   @unique\n  createdAt DateTime @default(now())\n}",
      score: 0.65,
      metadata: { prNumber: 35, filename: "prisma/schema.prisma", author: "carol" },
    },
  ].slice(0, topK);

  return mockResults;
}

export const CHROMA_STATUS = {
  connected: false,
  message: "ChromaDB placeholder active — install chromadb package and run ChromaDB server to enable real embeddings",
  collection: MOCK_COLLECTION,
  docsUrl: "https://docs.trychroma.com/getting-started",
};
