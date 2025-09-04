/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable @next/next/no-img-element */
'use client';

import { createContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./globals.css";
import { UserInfo } from "@/components/user-info";

// Create ThemeContext
export const ThemeContext = createContext<{
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}>({
  theme: "dark",
  setTheme: () => {},
});

export default function LayoutClient({
  children,
  geistSans,
  geistMono,
}: {
  children: React.ReactNode;
  geistSans: string;
  geistMono: string;
}) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
    document.documentElement.setAttribute('data-theme', savedTheme || 'dark');
    setIsMounted(true);

    // Disable React DevTools in production
    if (process.env.NODE_ENV === "production") {
      const devTools = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (typeof devTools === "object") {
        for (const [key, value] of Object.entries(devTools)) {
          devTools[key] = typeof value === "function" ? () => {} : null;
        }
      }

      // Disable right-click context menu
      const disableContextMenu = (e: Event) => e.preventDefault();
      window.addEventListener("contextmenu", disableContextMenu);

      // Disable certain keyboard shortcuts
      const disableShortcuts = (e: KeyboardEvent) => {
        if (
          e.key === "F12" ||
          (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) ||
          (e.ctrlKey && e.key === "U")
        ) {
          e.preventDefault();
        }
      };
      window.addEventListener("keydown", disableShortcuts);

      return () => {
        window.removeEventListener("contextmenu", disableContextMenu);
        window.removeEventListener("keydown", disableShortcuts);
      };
    }
  }, []);

  // Wrap setTheme to save to localStorage
  const setThemeAndSave = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const navItems = [
    { name: "Home", href: "/", icon: "🏠" },
    { name: "Snippets", href: "/snippets", icon: "📝" },
    { name: "Settings", href: "/settings", icon: "⚙️" },
    { name: "About", href: "/about", icon: "ℹ️" },
  ];

  if (!isMounted) {
    return null;
  }

  const sidebarVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0 },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeAndSave }}>
      <div
        className={`flex h-screen w-screen max-w-full max-h-full overflow-hidden font-geist-sans relative ${
          theme === 'dark' 
            ? 'bg-cyber-black text-cyber-text' 
            : 'bg-light-bg text-light-text'
        }`}
      >
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg backdrop-blur-md transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-cyber-surface/80 text-cyber-text border border-cyber-red/30 hover:border-cyber-red'
              : 'bg-light-surface/80 text-light-text border border-light-red/30 hover:border-light-red'
          }`}
        >
          <motion.div
            animate={{ rotate: isMobileMenuOpen ? 45 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </motion.div>
        </button>

        {/* Mobile Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={overlayVariants}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.aside
          initial="visible"
          animate={isMobileMenuOpen ? "visible" : { x: 0 }}
          variants={sidebarVariants}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`fixed lg:relative z-40 w-72 h-full backdrop-blur-md border-r transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-cyber-surface/90 border-cyber-red/20'
              : 'bg-light-surface/90 border-light-red/20'
          } ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-6 border-b ${
              theme === 'dark' ? 'border-cyber-red/20' : 'border-light-red/20'
            }`}
          >
            <a href="/" className="group block">
              <motion.h1
                whileHover={{ scale: 1.05 }}
                className={`text-2xl font-bold text-center transition-all duration-300 ${
                  theme === 'dark' ? 'text-cyber-red' : 'text-light-red'
                }`}
              >
                <span className="relative">
                  CodeWaltz
                  <motion.div
                    className={`absolute -inset-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                      theme === 'dark' ? 'bg-cyber-red/10' : 'bg-light-red/10'
                    }`}
                    animate={{
                      boxShadow: theme === 'dark' 
                        ? ['0 0 0px #FF003C', '0 0 20px #FF003C', '0 0 0px #FF003C']
                        : ['0 0 0px #E60026', '0 0 20px #E60026', '0 0 0px #E60026']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </span>
              </motion.h1>
            </a>
          </motion.div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-3">
              {navItems.map((item, index) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                >
                  <a
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg group transition-all duration-300 hover:scale-105 ${
                      theme === 'dark'
                        ? 'hover:bg-cyber-red/10 hover:border-cyber-red/30 border border-transparent text-cyber-text'
                        : 'hover:bg-light-red/10 hover:border-light-red/30 border border-transparent text-light-text'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                    <motion.div
                      className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                      whileHover={{ x: 5 }}
                    >
                      →
                    </motion.div>
                  </a>
                </motion.li>
              ))}
            </ul>
          </nav>

          {/* User Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`p-4 border-t ${
              theme === 'dark' ? 'border-cyber-red/20' : 'border-light-red/20'
            }`}
          >
            <UserInfo />
          </motion.div>
        </motion.aside>

        {/* Main Content */}
        <div className="flex flex-col flex-1 h-full relative">
          {/* Theme Toggle */}
          <motion.label
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            htmlFor="theme-toggle"
            className="absolute top-4 right-4 cursor-pointer select-none z-20 flex items-center space-x-3 p-2 rounded-lg backdrop-blur-md transition-all duration-300"
          >
            <motion.svg
              className={`w-5 h-5 transition-all duration-500 ${
                theme === "light" 
                  ? "opacity-100 text-light-orange scale-100" 
                  : "opacity-0 text-cyber-orange scale-75"
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
            >
              <circle cx="12" cy="12" r="5" />
              <path d="M13 1v2M12 21v2M4.22 4.22l1.42 1.42M18.96 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M19.36 5.64l1.42-1.42" />
            </motion.svg>
            
            <input
              id="theme-toggle"
              type="checkbox"
              className="theme-checkbox"
              checked={theme === "dark"}
              onChange={() => setThemeAndSave(theme === "light" ? "dark" : "light")}
              aria-label="Toggle theme"
            />
            
            <motion.svg
              className={`w-5 h-5 transition-all duration-500 ${
                theme === "dark" 
                  ? "opacity-100 text-cyber-white scale-100" 
                  : "opacity-0 text-light-white scale-75"
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              whileHover={{ rotate: -180 }}
              transition={{ duration: 0.5 }}
            >
              <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
            </motion.svg>
          </motion.label>

          {/* Main Content Area */}
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`flex-1 overflow-y-auto transition-all duration-300 relative ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-cyber-black via-cyber-black to-cyber-surface/20' 
                : 'bg-gradient-to-br from-light-bg via-light-bg to-light-surface/50'
            }`}
          >
            {/* Flowing background */}
            <div className={`absolute inset-0 ${
              theme === 'dark' ? 'flowing-bg' : 'flowing-bg-light'
            }`} />
            
            {/* Floating orbs for ambiance */}
            <div className="floating-orbs" />
            
            {/* Wave pattern overlay */}
            <div className="wave-pattern absolute inset-0" />
            
            {/* Content */}
            <div className="relative z-10 min-h-full">
              {children}
            </div>
          </motion.main>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}