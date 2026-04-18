"use client";

import { useState } from "react";
import Header from "@/app/components/Header";
import {
  Database,
  Search,
  Upload,
  Zap,
  ExternalLink,
  CheckCircle,
  Code,
} from "lucide-react";
import type { RagQueryResult } from "@/types";

const MOCK_STATUS = {
  connected: false,
  message:
    "ChromaDB placeholder active — install the chromadb package and run ChromaDB server to enable real embeddings.",
  collection: "commit-guard-code",
  docsUrl: "https://docs.trychroma.com/getting-started",
};

const SETUP_STEPS = [
  {
    step: "1",
    title: "Install ChromaDB",
    code: "npm install chromadb",
    color: "#6366f1",
  },
  {
    step: "2",
    title: "Run ChromaDB Server",
    code: "docker run -p 8000:8000 chromadb/chroma",
    color: "#06b6d4",
  },
  {
    step: "3",
    title: "Update lib/chroma.ts",
    code: "// Uncomment the ChromaClient code in lib/chroma.ts",
    color: "#10b981",
  },
];

export default function RAGPage() {
  const [queryText, setQueryText] = useState("");
  const [embedText, setEmbedText] = useState("");
  const [results, setResults] = useState<RagQueryResult[]>([]);
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [loadingEmbed, setLoadingEmbed] = useState(false);
  const [embedSuccess, setEmbedSuccess] = useState(false);

  async function handleQuery() {
    if (!queryText.trim()) return;
    setLoadingQuery(true);
    setResults([]);
    try {
      const res = await fetch("/api/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "query", query: queryText, topK: 5 }),
      });
      const data = await res.json();
      setResults(data.results ?? []);
    } finally {
      setLoadingQuery(false);
    }
  }

  async function handleEmbed() {
    if (!embedText.trim()) return;
    setLoadingEmbed(true);
    setEmbedSuccess(false);
    try {
      await fetch("/api/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "embed",
          text: embedText,
          metadata: { source: "manual", timestamp: Date.now() },
        }),
      });
      setEmbedSuccess(true);
      setEmbedText("");
      setTimeout(() => setEmbedSuccess(false), 3000);
    } finally {
      setLoadingEmbed(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header
        title="RAG Explorer"
        subtitle="ChromaDB vector search — placeholder mode"
      />

      <div style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>
        {/* Status Banner */}
        <div
          style={{
            display: "flex",
            gap: 14,
            padding: "16px 20px",
            borderRadius: 12,
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.25)",
            marginBottom: 24,
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              background: "rgba(245,158,11,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Database size={18} color="#f59e0b" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fbbf24", marginBottom: 4 }}>
              Placeholder Mode — ChromaDB not connected
            </div>
            <div style={{ fontSize: 12, color: "#78716c", lineHeight: 1.6 }}>
              {MOCK_STATUS.message}
            </div>
            <a
              href={MOCK_STATUS.docsUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: 12,
                color: "#f59e0b",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                marginTop: 8,
              }}
            >
              Read setup docs <ExternalLink size={11} />
            </a>
          </div>
          <div
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.2)",
              fontSize: 10,
              color: "#92400e",
              fontWeight: 700,
              letterSpacing: "0.06em",
              flexShrink: 0,
            }}
          >
            MOCK DATA
          </div>
        </div>

        {/* Setup Steps */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>
            To enable real ChromaDB:
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {SETUP_STEPS.map((s) => (
              <div
                key={s.step}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderRadius: 8,
                  background: "rgba(17,24,39,0.6)",
                  border: "1px solid rgba(99,102,241,0.1)",
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: `${s.color}20`,
                    border: `1px solid ${s.color}4d`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: s.color,
                    flexShrink: 0,
                  }}
                >
                  {s.step}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{s.title}</div>
                  <code
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                      background: "rgba(0,0,0,0.3)",
                      padding: "1px 6px",
                      borderRadius: 4,
                      marginTop: 2,
                      display: "inline-block",
                    }}
                  >
                    {s.code}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two columns */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Embed */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Upload size={16} color="#06b6d4" />
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>Embed Document</h2>
            </div>
            <textarea
              className="input"
              style={{ minHeight: 120, resize: "vertical", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}
              placeholder="Paste code or text to embed into ChromaDB…"
              value={embedText}
              onChange={(e) => setEmbedText(e.target.value)}
            />
            <button
              className="btn-primary"
              style={{ width: "100%", marginTop: 12 }}
              disabled={!embedText.trim() || loadingEmbed}
              onClick={handleEmbed}
            >
              {embedSuccess ? (
                <>
                  <CheckCircle size={15} color="#10b981" />
                  Embedded!
                </>
              ) : (
                <>
                  <Zap size={15} />
                  {loadingEmbed ? "Embedding…" : "Embed to ChromaDB"}
                </>
              )}
            </button>
          </div>

          {/* Query */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Search size={16} color="#8b5cf6" />
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>Semantic Query</h2>
            </div>
            <input
              className="input"
              placeholder="Describe the code you're looking for…"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQuery()}
            />
            <button
              className="btn-primary"
              style={{ width: "100%", marginTop: 12 }}
              disabled={!queryText.trim() || loadingQuery}
              onClick={handleQuery}
            >
              <Search size={15} />
              {loadingQuery ? "Searching…" : "Search Code Base"}
            </button>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 14 }}>
              Results (mock)
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {results.map((r, i) => (
                <div
                  key={r.id}
                  className="card animate-fade-in"
                  style={{ animationDelay: `${i * 0.05}s`, padding: "16px 20px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Code size={13} color="#6366f1" />
                      <span
                        style={{
                          fontSize: 11,
                          fontFamily: "JetBrains Mono, monospace",
                          color: "#818cf8",
                        }}
                      >
                        {String(r.metadata?.filename ?? r.id)}
                      </span>
                      {r.metadata?.prNumber !== undefined && (
                        <span
                          style={{
                            fontSize: 10,
                            color: "#475569",
                            background: "rgba(99,102,241,0.08)",
                            padding: "1px 6px",
                            borderRadius: 4,
                          }}
                        >
                          PR #{String(r.metadata.prNumber)}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: r.score > 0.8 ? "#10b981" : r.score > 0.6 ? "#f59e0b" : "#ef4444",
                      }}
                    >
                      {(r.score * 100).toFixed(0)}% match
                    </div>
                  </div>
                  <pre
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                      background: "rgba(0,0,0,0.3)",
                      padding: "10px 12px",
                      borderRadius: 6,
                      overflow: "auto",
                      lineHeight: 1.6,
                      margin: 0,
                      fontFamily: "JetBrains Mono, monospace",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {r.document}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
