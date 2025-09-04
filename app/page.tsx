"use client";
import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence, stagger } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { fetchSnippets, type Snippet } from "@/lib/supabase/snippets";
import { ThemeContext } from "./LayoutClient";

export default function Home() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const loadSnippets = async () => {
      try {
        const data = await fetchSnippets();
        setSnippets(data);
      } catch (err) {
        // For demo purposes, show sample data when Supabase isn't configured
        const sampleData: Snippet[] = [
          {
            id: "1",
            title: "React Hook Example",
            language: "javascript",
            code: `import { useState, useEffect } from 'react';

export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  const reset = () => setCount(initialValue);
  
  return { count, increment, decrement, reset };
}`,
            author: "CodeWaltz Demo",
            user_id: "demo",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "2",
            title: "Python Data Processing",
            language: "python",
            code: `import pandas as pd
import numpy as np

def process_data(df):
    # Clean and transform data
    df_clean = df.dropna()
    df_clean['normalized'] = (df_clean['value'] - df_clean['value'].mean()) / df_clean['value'].std()
    
    return df_clean.groupby('category').agg({
        'normalized': ['mean', 'std', 'count'],
        'value': 'sum'
    }).round(2)`,
            author: "Data Scientist",
            user_id: "demo",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "3",
            title: "CSS Grid Layout",
            language: "css",
            code: `.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

.grid-item {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.grid-item:hover {
  transform: translateY(-5px);
}`,
            author: "UI Designer",
            user_id: "demo",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
        setSnippets(sampleData);
        console.log("Using sample data for demo purposes");
      } finally {
        setLoading(false);
      }
    };
    loadSnippets();
  }, []);

  const handleCopy = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const filteredSnippets = snippets.filter(snippet => {
    const matchesLanguage = selectedLanguage === "all" || snippet.language === selectedLanguage;
    const matchesSearch = snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         snippet.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLanguage && matchesSearch;
  });

  const languages = [...new Set(snippets.map(s => s.language))];

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

  const heroVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
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
        <motion.div
          initial="hidden"
          animate="visible"
          variants={heroVariants}
          className="text-center mb-16"
        >
          <h1 className={`text-6xl lg:text-8xl font-bold mb-6 bg-gradient-to-r ${
            theme === 'dark' 
              ? 'from-cyber-red via-cyber-purple to-cyber-cyan' 
              : 'from-light-red via-light-purple to-light-cyan'
          } bg-clip-text text-transparent`}>
            CodeWaltz
          </h1>
          <p className={`text-xl lg:text-2xl mb-8 max-w-3xl mx-auto ${
            theme === 'dark' ? 'text-cyber-text-muted' : 'text-light-text-muted'
          }`}>
            Dance around with your code by saving your snippets and have a waltz with snippets published by others.
          </p>
        </motion.div>
        
        <motion.div
          className="flex justify-center items-center space-x-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className={`w-3 h-3 rounded-full ${theme === 'dark' ? 'bg-cyber-red' : 'bg-light-red'}`} />
          <div className={`w-3 h-3 rounded-full ${theme === 'dark' ? 'bg-cyber-purple' : 'bg-light-purple'}`} />
          <div className={`w-3 h-3 rounded-full ${theme === 'dark' ? 'bg-cyber-white' : 'bg-light-white'}`} />
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
        className="p-8 max-w-7xl mx-auto text-center"
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={heroVariants}
        >
          <h1 className={`text-6xl lg:text-8xl font-bold mb-6 bg-gradient-to-r ${
            theme === 'dark' 
              ? 'from-cyber-red via-cyber-purple to-cyber-cyan' 
              : 'from-light-red via-light-purple to-light-cyan'
          } bg-clip-text text-transparent`}>
            CodeWaltz
          </h1>
          <p className={`text-xl lg:text-2xl mb-8 max-w-3xl mx-auto ${
            theme === 'dark' ? 'text-cyber-text-muted' : 'text-light-text-muted'
          }`}>
            Dance around with your code by saving your snippets and have a waltz with snippets published by others.
          </p>
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
        </motion.div>
      </motion.main>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 max-w-7xl mx-auto"
    >
      {/* Hero Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={heroVariants}
        className="text-center mb-16"
      >
        <h1 className={`text-6xl lg:text-8xl font-bold mb-6 bg-gradient-to-r ${
          theme === 'dark' 
            ? 'from-cyber-red via-cyber-purple to-cyber-white' 
            : 'from-light-red via-light-purple to-light-white'
        } bg-clip-text text-transparent`}>
          CodeWaltz
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`text-xl lg:text-2xl mb-8 max-w-3xl mx-auto ${
            theme === 'dark' ? 'text-cyber-text-muted' : 'text-light-text-muted'
          }`}
        >
          Dance around with your code by saving your snippets and have a waltz with snippets published by others.
        </motion.p>
      </motion.div>

      {/* Filters & Search */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-12 space-y-6"
      >
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto">
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="text"
            placeholder="Search snippets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full px-6 py-4 rounded-2xl backdrop-blur-md border transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-cyber-surface/50 border-cyber-red/30 text-cyber-text placeholder-cyber-text-muted focus:border-cyber-red focus:bg-cyber-surface/80'
                : 'bg-light-surface/50 border-light-red/30 text-light-text placeholder-light-text-muted focus:border-light-red focus:bg-light-surface/80'
            }`}
          />
          <motion.div
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
              theme === 'dark' ? 'text-cyber-white' : 'text-light-white'
            }`}
            animate={{ rotate: searchTerm ? 180 : 0 }}
          >
            🔍
          </motion.div>
        </div>

        {/* Language Filter */}
        <div className="flex flex-wrap justify-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedLanguage("all")}
            className={`px-6 py-2 rounded-full transition-all duration-300 border ${
              selectedLanguage === "all"
                ? theme === 'dark'
                  ? 'bg-cyber-red text-white border-cyber-red shadow-lg shadow-cyber-red/25'
                  : 'bg-light-red text-white border-light-red shadow-lg shadow-light-red/25'
                : theme === 'dark'
                  ? 'bg-cyber-surface/50 text-cyber-text-muted border-cyber-surface hover:border-cyber-red/50'
                  : 'bg-light-surface/50 text-light-text-muted border-light-surface hover:border-light-red/50'
            }`}
          >
            All ({snippets.length})
          </motion.button>
          {languages.map((lang) => (
            <motion.button
              key={lang}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-6 py-2 rounded-full transition-all duration-300 border capitalize ${
                selectedLanguage === lang
                  ? theme === 'dark'
                    ? 'bg-cyber-purple text-white border-cyber-purple shadow-lg shadow-cyber-purple/25'
                    : 'bg-light-purple text-white border-light-purple shadow-lg shadow-light-purple/25'
                  : theme === 'dark'
                    ? 'bg-cyber-surface/50 text-cyber-text-muted border-cyber-surface hover:border-cyber-purple/50'
                    : 'bg-light-surface/50 text-light-text-muted border-light-surface hover:border-light-purple/50'
              }`}
            >
              {lang} ({snippets.filter(s => s.language === lang).length})
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Snippets Grid */}
      <AnimatePresence mode="wait">
        <motion.section
          key={selectedLanguage + searchTerm}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {filteredSnippets.map((snippet) => (
            <motion.article
              key={snippet.id}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`backdrop-blur-md rounded-2xl p-6 border transition-all duration-300 group relative overflow-hidden ${
                theme === 'dark'
                  ? 'bg-cyber-surface/30 border-cyber-surface hover:border-cyber-white/50 hover:bg-cyber-surface/50'
                  : 'bg-light-surface/30 border-light-surface hover:border-light-white/50 hover:bg-light-surface/50'
              }`}
            >
              {/* Glow effect on hover */}
              <motion.div
                className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                  theme === 'dark' ? 'bg-gradient-to-br from-cyber-white/5 to-cyber-purple/5' : 'bg-gradient-to-br from-light-white/5 to-light-purple/5'
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
              <div className={`relative z-10 flex items-center justify-between text-sm ${
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
            </motion.article>
          ))}
        </motion.section>
      </AnimatePresence>

      {/* Empty State */}
      {filteredSnippets.length === 0 && !loading && (
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
            🔍
          </motion.div>
          <h3 className={`text-2xl font-bold mb-4 ${
            theme === 'dark' ? 'text-cyber-text' : 'text-light-text'
          }`}>
            No snippets found
          </h3>
          <p className={`${
            theme === 'dark' ? 'text-cyber-text-muted' : 'text-light-text-muted'
          }`}>
            Try adjusting your search or filter criteria
          </p>
        </motion.div>
      )}
    </motion.main>
  );
}