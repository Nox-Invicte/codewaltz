"use client";
import { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { fetchSnippets, type Snippet } from "@/lib/supabase/snippets";

export default function Home() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSnippets = async () => {
      try {
        const data = await fetchSnippets();
        setSnippets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load snippets");
      } finally {
        setLoading(false);
      }
    };
    loadSnippets();
  }, []);

  if (loading) {
    return (
      <main className="p-8 max-w-5xl mx-auto">
        <h1 className="text-6xl font-bold mb-8">Welcome to CodeWaltz</h1>
        <p className="text-2xl mb-12">
          Dance around with your code by saving your snippets and have a waltz with snippets published by others.
        </p>
        <p>Loading snippets...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-8 max-w-5xl mx-auto">
        <h1 className="text-6xl font-bold mb-8">Welcome to CodeWaltz</h1>
        <p className="text-2xl mb-12">
          Dance around with your code by saving your snippets and have a waltz with snippets published by others.
        </p>
        <p className="text-red-500">Error: {error}</p>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <h1 className="text-6xl font-bold mb-8">Welcome to CodeWaltz</h1>
      <p className="text-2xl mb-12">
        Dance around with your code by saving your snippets and have a waltz with snippets published by others.
      </p>
      <section className="space-y-12">
        {snippets.map(({ id, title, language, code, author, created_at, updated_at }) => (
          <article key={id} className="bg-gray-800 rounded-lg p-6 shadow-lg relative group">
            <button
              onClick={() => navigator.clipboard.writeText(code).then(() => alert('Code copied to clipboard!'))}
              className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              Copy
            </button>
            <h2 className="text-2xl font-semibold mb-4 text-white">{title}</h2>
            <SyntaxHighlighter
              language={language}
              style={oneDark}
              customStyle={{ fontFamily: "var(--font-geist-mono)" }}
              showLineNumbers
            >
              {code}
            </SyntaxHighlighter>
            <p className="mt-4 text-sm text-gray-400">Author: {author}</p>
            <p className="mt-1 text-xs text-gray-500">
              Created: {new Date(created_at).toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Updated: {new Date(updated_at).toLocaleString()}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
