"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const sampleSnippets = [
  {
    id: 1,
    title: "Hello World in JavaScript",
    language: "javascript",
    code: `console.log("Hello, world!");`,
    author: "Alice",
  },
  {
    id: 2,
    title: "Factorial Function in Python",
    language: "python",
    code: `def factorial(n):
    return 1 if n == 0 else n * factorial(n - 1)`,
    author: "Bob",
  },
  {
    id: 3,
    title: "Simple React Component",
    language: "jsx",
    code: `function Greeting() {
  return <h1>Hello, CodeWaltz!</h1>;
}`,
    author: "Carol",
  },
];

export default function Home() {
  return (
    <main className="p-8 max-w-5xl mx-auto">
      <h1 className="text-6xl font-bold mb-8">Welcome to CodeWaltz</h1>
      <p className="text-2xl mb-12">
        Dance around with your code by saving your snippets and have a waltz with snippets published by others.
      </p>
      <section className="space-y-12">
        {sampleSnippets.map(({ id, title, language, code, author }) => (
          <article key={id} className="bg-gray-800 rounded-lg p-6 shadow-lg">
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
          </article>
        ))}
      </section>
    </main>
  );
}
