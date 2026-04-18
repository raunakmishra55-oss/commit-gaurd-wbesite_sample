import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CommitGuard — AI-Powered PR Intelligence",
  description:
    "Analyze GitHub pull requests with AI-powered summarization, Effort-to-Impact scoring, contributor matching, and RAG-ready code embeddings.",
  keywords: ["GitHub", "pull requests", "code review", "AI", "developer tools"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
