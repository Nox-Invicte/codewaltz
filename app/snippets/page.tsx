"use client";

import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { fetchSnippets, fetchUserSnippets, addSnippet, updateSnippet, deleteSnippet, type Snippet } from "@/lib/supabase/snippets";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { ThemeContext } from "@/app/LayoutClient";

export default function SnippetsPage() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const loadSnippets = async () => {
      try {
        if (!currentUser) {
          setSnippets([]);
          setLoading(false);
          return;
        }
        const data = await fetchUserSnippets(currentUser.id);
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

  const handleCopy = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // State for confirmation dialog
  type ConfirmActionType = "Save" | "Delete" | null;
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    actionType: ConfirmActionType;
    targetId: string | null;
  }>({
    isOpen: false,
    actionType: null,
    targetId: null,
  });

  const openConfirmDialog = (actionType: "Save" | "Delete", targetId: string | null = null) => {
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
      alert("Failed to Delete snippet");
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
      openConfirmDialog("Save");
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
    openConfirmDialog("Delete", id);
  };

  const handleCancelEdit = () => {
    setForm({ title: "", language: "javascript", code: "", author: "" });
    setEditingId(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
  };

  if (loading) {
    return (
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-8 max-w-7xl mx-auto"
      >
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-5xl lg:text-6xl font-bold mb-8 bg-gradient-to-r ${
            theme === 'dark' 
              ? 'from-cyber-red via-cyber-purple to-cyber-white' 
              : 'from-light-red via-light-purple to-light-white'
          } bg-clip-text text-transparent`}
        >
          Your Snippets
        </motion.h1>
        <motion.div
          className="flex justify-center items-center space-x-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className={`w-3 h-3 rounded-full ${theme === 'dark' ? 'bg-cyber-red' : 'bg-light-red'}`} />
          <div className={`w-3 h-3 rounded-full ${theme === 'dark' ? 'bg-cyber-purple' : 'bg-light-purple'}`} />
          <div className={`w-3 h-3 rounded-full ${theme === 'dark' ? 'bg-cyber-cyan' : 'bg-light-cyan'}`} />
          <span className={`ml-4 text-lg ${theme === 'dark' ? 'text-cyber-text-muted' : 'text-light-text-muted'}`}>
            Loading snippets...
          </span>
        </motion.div>
      </motion.main>
    );
  }

  if (error) {
    return (
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-8 max-w-7xl mx-auto"
      >
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-5xl lg:text-6xl font-bold mb-8 bg-gradient-to-r ${
            theme === 'dark' 
              ? 'from-cyber-red via-cyber-purple to-cyber-white' 
              : 'from-light-red via-light-purple to-light-white'
          } bg-clip-text text-transparent`}
        >
          Your Snippets
        </motion.h1>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`p-6 rounded-2xl backdrop-blur-md border ${
            theme === 'dark' 
              ? 'bg-cyber-orange/10 border-cyber-orange/30 text-cyber-orange' 
              : 'bg-light-orange/10 border-light-orange/30 text-light-orange'
          }`}
        >
          <span className="text-4xl mb-4 inline-block">⚠️</span>
          <p className="text-lg font-medium">Error: {error}</p>
        </motion.div>
      </motion.main>
    );
  }

  return (
    <>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-8 max-w-7xl mx-auto"
      >
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-5xl lg:text-6xl font-bold mb-8 bg-gradient-to-r ${
            theme === 'dark' 
              ? 'from-cyber-red via-cyber-purple to-cyber-white' 
              : 'from-light-red via-light-purple to-light-white'
          } bg-clip-text text-transparent`}
        >
          Your Snippets
        </motion.h1>

        {!displayName && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-8 p-6 rounded-2xl backdrop-blur-md border ${
              theme === 'dark'
                ? 'bg-cyber-orange/10 border-cyber-orange/30 text-cyber-orange'
                : 'bg-light-orange/10 border-light-orange/30 text-light-orange'
            }`}
          >
            <p className="mb-4 font-medium">You need to set your display name before creating snippets.</p>
            <Link 
              href="/settings" 
              className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-cyber-orange/20 hover:bg-cyber-orange/30 border border-cyber-orange/50'
                  : 'bg-light-orange/20 hover:bg-light-orange/30 border border-light-orange/50'
              }`}
            >
              Go to Settings →
            </Link>
          </motion.div>
        )}

        {/* Add/Edit Form */}
        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleAddSnippet}
          className={`mb-12 backdrop-blur-md rounded-2xl p-8 border transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-cyber-surface/30 border-cyber-surface'
              : 'bg-light-surface/30 border-light-surface'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Title */}
            <div className="space-y-2">
              <label className={`block font-medium ${
                theme === 'dark' ? 'text-cyber-text' : 'text-light-text'
              }`} htmlFor="title">
                Title <span className={theme === 'dark' ? 'text-cyber-red' : 'text-light-red'}>*</span>
              </label>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleInputChange}
                className={`w-full p-4 rounded-xl backdrop-blur-md border transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-cyber-surface/50 border-cyber-surface text-cyber-text placeholder-cyber-text-muted focus:border-cyber-red'
                    : 'bg-light-surface/50 border-light-surface text-light-text placeholder-light-text-muted focus:border-light-red'
                }`}
                required
              />
            </div>

            {/* Language */}
            <div className="space-y-2">
              <label className={`block font-medium ${
                theme === 'dark' ? 'text-cyber-text' : 'text-light-text'
              }`} htmlFor="language">
                Language
              </label>
              <motion.select
                whileFocus={{ scale: 1.02 }}
                id="language"
                name="language"
                value={form.language}
                onChange={handleInputChange}
                className={`w-full p-4 rounded-xl backdrop-blur-md border transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-cyber-surface/50 border-cyber-surface text-cyber-text focus:border-cyber-purple'
                    : 'bg-light-surface/50 border-light-surface text-light-text focus:border-light-purple'
                }`}
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
              </motion.select>
            </div>
          </div>

          {/* Code */}
          <div className="mb-6 space-y-2">
            <label className={`block font-medium ${
              theme === 'dark' ? 'text-cyber-text' : 'text-light-text'
            }`} htmlFor="code">
              Code <span className={theme === 'dark' ? 'text-cyber-red' : 'text-light-red'}>*</span>
            </label>
            <motion.textarea
              whileFocus={{ scale: 1.01 }}
              id="code"
              name="code"
              rows={8}
              value={form.code}
              onChange={handleInputChange}
              className={`w-full p-4 rounded-xl backdrop-blur-md border font-mono transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-cyber-surface/50 border-cyber-surface text-cyber-text placeholder-cyber-text-muted focus:border-cyber-cyan'
                  : 'bg-light-surface/50 border-light-surface text-light-text placeholder-light-text-muted focus:border-light-cyan'
              }`}
              required
            />
          </div>

          {editingId && (
            <div className="mb-6 space-y-2">
              <label className={`block font-medium ${
                theme === 'dark' ? 'text-cyber-text' : 'text-light-text'
              }`} htmlFor="author">
                Author <span className={theme === 'dark' ? 'text-cyber-red' : 'text-light-red'}>*</span>
              </label>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                id="author"
                name="author"
                type="text"
                value={form.author}
                onChange={handleInputChange}
                className={`w-full p-4 rounded-xl backdrop-blur-md border transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-cyber-surface/50 border-cyber-surface text-cyber-text placeholder-cyber-text-muted focus:border-cyber-red'
                    : 'bg-light-surface/50 border-light-surface text-light-text placeholder-light-text-muted focus:border-light-red'
                }`}
                required
              />
            </div>
          )}

          {!editingId && displayName && (
            <p className={`text-sm mb-6 ${
              theme === 'dark' ? 'text-cyber-text-muted' : 'text-light-text-muted'
            }`}>
              Author will be set to: <strong>{displayName}</strong>
            </p>
          )}

          <div className="flex flex-wrap gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-cyber-red text-white hover:bg-cyber-red/80 shadow-lg shadow-cyber-red/25'
                  : 'bg-light-red text-white hover:bg-light-red/80 shadow-lg shadow-light-red/25'
              }`}
            >
              {editingId !== null ? "Update Snippet" : "Add Snippet"}
            </motion.button>
            
            {editingId !== null && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleCancelEdit}
                className={`px-6 py-3 rounded-xl font-bold border transition-all duration-300 ${
                  theme === 'dark'
                    ? 'border-cyber-surface text-cyber-text-muted hover:border-cyber-surface/50 hover:bg-cyber-surface/10'
                    : 'border-light-surface text-light-text-muted hover:border-light-surface/50 hover:bg-light-surface/10'
                }`}
              >
                Cancel Edit
              </motion.button>
            )}
          </div>
          
          <p className={`mt-4 text-sm ${
            theme === 'dark' ? 'text-cyber-red' : 'text-light-red'
          }`}>
            * marked fields are required.
          </p>
        </motion.form>

        {/* Snippets Grid */}
        <AnimatePresence mode="wait">
          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {snippets.map((snippet) => (
              <motion.article
                key={snippet.id}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`backdrop-blur-md rounded-2xl p-6 border transition-all duration-300 group relative overflow-hidden ${
                  theme === 'dark'
                    ? 'bg-cyber-surface/30 border-cyber-surface hover:border-cyber-cyan/50 hover:bg-cyber-surface/50'
                    : 'bg-light-surface/30 border-light-surface hover:border-light-cyan/50 hover:bg-light-surface/50'
                }`}
              >
                {/* Glow effect on hover */}
                <motion.div
                  className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                    theme === 'dark' ? 'bg-gradient-to-br from-cyber-cyan/5 to-cyber-purple/5' : 'bg-gradient-to-br from-light-cyan/5 to-light-purple/5'
                  }`}
                />

                {/* Copy Button */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  className={`absolute top-4 right-4 z-10 p-2 rounded-lg backdrop-blur-md transition-all duration-300 ${
                    copiedId === snippet.id
                      ? theme === 'dark'
                        ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/50'
                        : 'bg-light-cyan/20 text-light-cyan border border-light-cyan/50'
                      : theme === 'dark'
                        ? 'bg-cyber-surface/80 text-cyber-text-muted border border-cyber-surface opacity-0 group-hover:opacity-100 hover:text-cyber-cyan hover:border-cyber-cyan/50'
                        : 'bg-light-surface/80 text-light-text-muted border border-light-surface opacity-0 group-hover:opacity-100 hover:text-light-cyan hover:border-light-cyan/50'
                  }`}
                  onClick={() => handleCopy(snippet.code, snippet.id)}
                >
                  {copiedId === snippet.id ? '✓' : '📋'}
                </motion.button>

                {/* Header */}
                <div className="relative z-10 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-cyber-text' : 'text-light-text'
                    }`}>
                      {snippet.title}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                      theme === 'dark'
                        ? 'bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/30'
                        : 'bg-light-purple/20 text-light-purple border border-light-purple/30'
                    }`}>
                      {snippet.language}
                    </span>
                  </div>
                </div>

                {/* Code */}
                <div className="relative z-10 mb-6 rounded-xl overflow-hidden">
                  <SyntaxHighlighter
                    language={snippet.language}
                    style={theme === 'dark' ? oneDark : oneLight}
                    customStyle={{
                      fontFamily: "var(--font-geist-mono)",
                      margin: 0,
                      borderRadius: "12px",
                      background: theme === 'dark' ? "#0f0f0f" : "#f8f8f8",
                    }}
                    showLineNumbers
                  >
                    {snippet.code}
                  </SyntaxHighlighter>
                </div>

                {/* Footer */}
                <div className={`relative z-10 flex items-center justify-between text-sm mb-4 ${
                  theme === 'dark' ? 'text-cyber-text-muted' : 'text-light-text-muted'
                }`}>
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <span>👤</span>
                      <span>{snippet.author}</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs">
                    <span>📅 {new Date(snippet.created_at).toLocaleDateString()}</span>
                    {snippet.updated_at !== snippet.created_at && (
                      <span>✏️ {new Date(snippet.updated_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {currentUser && currentUser.id === snippet.user_id && (
                  <div className="relative z-10 flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEdit(snippet.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        theme === 'dark'
                          ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30 hover:bg-cyber-cyan/30'
                          : 'bg-light-cyan/20 text-light-cyan border border-light-cyan/30 hover:bg-light-cyan/30'
                      }`}
                    >
                      Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(snippet.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        theme === 'dark'
                          ? 'bg-cyber-orange/20 text-cyber-orange border border-cyber-orange/30 hover:bg-cyber-orange/30'
                          : 'bg-light-orange/20 text-light-orange border border-light-orange/30 hover:bg-light-orange/30'
                      }`}
                    >
                      Delete
                    </motion.button>
                  </div>
                )}
              </motion.article>
            ))}
          </motion.section>
        </AnimatePresence>

        {/* Empty State */}
        {snippets.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              📝
            </motion.div>
            <h3 className={`text-2xl font-bold mb-4 ${
              theme === 'dark' ? 'text-cyber-text' : 'text-light-text'
            }`}>
              No snippets yet
            </h3>
            <p className={`${
              theme === 'dark' ? 'text-cyber-text-muted' : 'text-light-text-muted'
            }`}>
              Create your first code snippet using the form above
            </p>
          </motion.div>
        )}
      </motion.main>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmDialog.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
            onClick={closeConfirmDialog}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`backdrop-blur-md rounded-2xl p-8 border max-w-md w-full mx-4 ${
                theme === 'dark'
                  ? 'bg-cyber-surface/90 border-cyber-surface'
                  : 'bg-light-surface/90 border-light-surface'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className={`text-2xl font-bold mb-4 ${
                theme === 'dark' ? 'text-cyber-text' : 'text-light-text'
              }`}>
                {confirmDialog.actionType === "Save" ? "Confirm Save" : "Confirm Delete"}
              </h2>
              <p className={`mb-8 ${
                theme === 'dark' ? 'text-cyber-text-muted' : 'text-light-text-muted'
              }`}>
                {confirmDialog.actionType === "Save"
                  ? "Are you sure you want to save the changes?"
                  : "Are you sure you want to delete this snippet? This action cannot be undone."}
              </p>
              <div className="flex justify-end space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={closeConfirmDialog}
                  className={`px-6 py-3 rounded-xl font-medium border transition-all duration-300 ${
                    theme === 'dark'
                      ? 'border-cyber-surface text-cyber-text-muted hover:border-cyber-surface/50 hover:bg-cyber-surface/10'
                      : 'border-light-surface text-light-text-muted hover:border-light-surface/50 hover:bg-light-surface/10'
                  }`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={confirmDialog.actionType === "Save" ? confirmSave : confirmDelete}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                    confirmDialog.actionType === "Save"
                      ? theme === 'dark'
                        ? 'bg-cyber-cyan text-white hover:bg-cyber-cyan/80 shadow-lg shadow-cyber-cyan/25'
                        : 'bg-light-cyan text-white hover:bg-light-cyan/80 shadow-lg shadow-light-cyan/25'
                      : theme === 'dark'
                        ? 'bg-cyber-orange text-white hover:bg-cyber-orange/80 shadow-lg shadow-cyber-orange/25'
                        : 'bg-light-orange text-white hover:bg-light-orange/80 shadow-lg shadow-light-orange/25'
                  }`}
                >
                  Confirm
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
