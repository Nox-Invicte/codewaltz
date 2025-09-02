"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { fetchSnippets, fetchUserSnippets, addSnippet, updateSnippet, deleteSnippet, type Snippet } from "@/lib/supabase/snippets";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function SnippetsPage() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    const loadSnippets = async () => {
      try {
        if (!currentUser) {
          setSnippets([]);
          setLoading(false);
          return;
        }
        const data = await fetchUserSnippets(currentUser.id);
        console.log("User snippets fetched in page:", data);
        setSnippets(data);
      } catch (err) {
        console.error("Error loading user snippets in page:", err);
        setError(err instanceof Error ? err.message : "Failed to load snippets");
      } finally {
        setLoading(false);
      }
    };
    loadSnippets();
  }, [currentUser]);

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      setDisplayName(user?.user_metadata?.username ?? "");
    };
    loadUser();
  }, []);

  const [form, setForm] = useState({
    title: "",
    language: "javascript",
    code: "",
    author: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // State for confirmation dialog
  type ConfirmActionType = "save" | "delete" | null;
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    actionType: ConfirmActionType;
    targetId: string | null;
  }>({
    isOpen: false,
    actionType: null,
    targetId: null,
  });

  const openConfirmDialog = (actionType: "save" | "delete", targetId: string | null = null) => {
    setConfirmDialog({ isOpen: true, actionType, targetId });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, actionType: null, targetId: null });
  };

  const confirmSave = async () => {
    if (!editingId) return;
    try {
      const updatedSnippet = await updateSnippet(editingId, {
        title: form.title,
        language: form.language,
        code: form.code,
        author: form.author,
      });
      setSnippets((prev) =>
        prev.map((snippet) =>
          snippet.id === editingId ? updatedSnippet : snippet
        )
      );
      setEditingId(null);
      setForm({ title: "", language: "javascript", code: "", author: "" });
      closeConfirmDialog();
    } catch (err) {
      alert("Failed to update snippet");
    }
  };

  const confirmDelete = async () => {
    const id = confirmDialog.targetId;
    if (!id) return;
    try {
      await deleteSnippet(id);
      if (editingId === id) {
        setForm({ title: "", language: "javascript", code: "", author: "" });
        setEditingId(null);
      }
      setSnippets((prev) => prev.filter((snippet) => snippet.id !== id));
      closeConfirmDialog();
    } catch (err) {
      alert("Failed to delete snippet");
    }
  };

  const handleAddSnippet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.code) {
      alert("Please fill in all required fields.");
      return;
    }
    if (!displayName) {
      alert("Please set your display name first in settings.");
      return;
    }
    if (editingId !== null) {
      openConfirmDialog("save");
    } else {
      try {
        const newSnippet = await addSnippet({
          title: form.title,
          language: form.language,
          code: form.code,
          author: displayName,
        });
        setSnippets((prev) => [newSnippet, ...prev]);
        setForm({ title: "", language: "javascript", code: "", author: "" });
      } catch (err) {
        alert("Failed to add snippet");
      }
    }
  };

  const handleEdit = (id: string) => {
    const snippetToEdit = snippets.find((snippet) => snippet.id === id);
    if (snippetToEdit) {
      setForm({
        title: snippetToEdit.title,
        language: snippetToEdit.language,
        code: snippetToEdit.code,
        author: snippetToEdit.author,
      });
      setEditingId(id);
    }
  };

  const handleDelete = (id: string) => {
    openConfirmDialog("delete", id);
  };

  const handleCancelEdit = () => {
    setForm({ title: "", language: "javascript", code: "", author: "" });
    setEditingId(null);
  };

  if (loading) {
    return (
      <main className="p-8 max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold mb-8">Your Snippets</h1>
        <p>Loading snippets...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-8 max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold mb-8">Your Snippets</h1>
        <p className="text-red-500">Error: {error}</p>
      </main>
    );
  }

  return (
    <>
      <main className="p-8 max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold mb-8">Your Snippets</h1>

        {!displayName && (
          <div className="mb-8 p-4 bg-yellow-600 text-white rounded-lg">
            <p className="mb-2">You need to set your display name before creating snippets.</p>
            <Link href="/settings" className="underline">
              Go to Settings
            </Link>
          </div>
        )}

        <form
          onSubmit={handleAddSnippet}
          className="mb-12 bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <div className="mb-4">
            <label className="block text-white mb-2" htmlFor="title">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleInputChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-white mb-2" htmlFor="language">
              Language
            </label>
            <select
              id="language"
              name="language"
              value={form.language}
              onChange={handleInputChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="jsx">JSX</option>
              <option value="java">Java</option>
              <option value="c">C</option>
              <option value="cpp">C++</option>
              <option value="bash">Bash</option>
              <option value="ruby">Ruby</option>
              <option value="go">Go</option>
              <option value="typescript">TypeScript</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-white mb-2" htmlFor="code">
              Code <span className="text-red-500">*</span>
            </label>
            <textarea
              id="code"
              name="code"
              rows={6}
              value={form.code}
              onChange={handleInputChange}
              className="w-full p-2 rounded bg-gray-700 text-white font-mono"
              required
            />
          </div>

          {editingId && (
            <div className="mb-4">
              <label className="block text-white mb-2" htmlFor="author">
                Author <span className="text-red-500">*</span>
              </label>
              <input
                id="author"
                name="author"
                type="text"
                value={form.author}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              />
            </div>
          )}
          {!editingId && displayName && (
            <p className="text-sm text-gray-400 mb-4">Author will be set to: {displayName}</p>
          )}

          <button
            type="submit"
            className="bg-purple-700 hover:bg-purple-900 text-white font-bold py-2 px-4 rounded"
          >
            {editingId !== null ? "Update Snippet" : "Add Snippet"}
          </button>
          {editingId !== null && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="ml-4 bg-gray-600 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
            >
              Cancel Edit
            </button>
          )}
          <p className="mt-3 text-sb text-red-500">* marked fields are required.</p>
        </form>

        <section className="space-y-12">
          {snippets.map(({ id, title, language, code, author, user_id, created_at, updated_at }) => (
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
              {currentUser && currentUser.id === user_id && (
                <div className="mt-4 flex space-x-4">
                  <button
                    onClick={() => handleEdit(id)}
                    className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-1 px-3 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(id)}
                    className="bg-red-600 hover:bg-red-800 text-white font-bold py-1 px-3 rounded"
                  >
                    Delete
                  </button>
                </div>
              )}
            </article>
          ))}
        </section>
      </main>

      {confirmDialog.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-0 z-50">
          <div className="bg-gray-900 p-6 border-4 border-gray-400 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4 text-white">
              {confirmDialog.actionType === "save"
                ? "Confirm Save"
                : "Confirm Delete"}
            </h2>
            <p className="mb-6 text-white">
              {confirmDialog.actionType === "save"
                ? "Are you sure you want to save the changes?"
                : "Are you sure you want to delete this snippet?"}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeConfirmDialog}
                className="bg-gray-600 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={
                  confirmDialog.actionType === "save"
                    ? confirmSave
                    : confirmDelete
                }
                className="bg-purple-700 hover:bg-purple-900 text-white font-bold py-2 px-4 rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
