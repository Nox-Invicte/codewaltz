/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable @next/next/no-img-element */
'use client';

import { createContext, useState, useEffect, useRef } from "react";
import Avatar from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import "./globals.css";
import { UserInfo } from "@/components/user-info";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  // Load current user and handle click-outside for profile menu
  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    loadUser();

    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('click', onClickOutside);
    return () => document.removeEventListener('click', onClickOutside);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setCurrentUser(null);
    setIsProfileMenuOpen(false);
    window.location.href = "/";
  };

  // Wrap setTheme to save to localStorage
  const setThemeAndSave = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const navItems = [
    { name: "Home", href: "/", icon: "🏠" },
    { name: "Snippets", href: "/snippets", icon: "📝" },
    { name: "Dashboard", href: "__profile__", icon: "📊" },
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
        className={`flex h-screen w-screen max-w-full max-h-full overflow-hidden font-geist-sans relative bg-[var(--background)] text-[var(--text-primary)]`}
      >
        {/* Top Navbar */}
        <header
          className="fixed top-0 left-0 right-0 z-40 border-b backdrop-blur-md card bordered"
        >
          {theme === 'dark' && (
            <div
              className="pointer-events-none absolute inset-0 glow-green glow-blue"
              style={{ boxShadow: '0 0 35px rgba(0,255,136,0.25), 0 0 65px rgba(56,189,248,0.18)' }}
            />
          )}
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between relative">
            {/* ...existing code... */}
            <a href="/" className="group ml-12">
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="text-2xl md:text-3xl font-bold primary-accent"
                style={{ textShadow: '0 0 8px rgba(0,255,136,0.5)' }}
              >
                CodeWaltz
              </motion.span>
            </a>
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8 text-lg">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.name}
                  href={item.href === "__profile__" ? (currentUser ? `/profile/${currentUser.id}` : "/auth/login") : item.href}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  whileHover={{ scale: 1.05 }}
                  className="transition-all text-secondary"
                  style={{ textShadow: 'none' }}
                >
                  {item.name}
                </motion.a>
              ))}
            </nav>
            {/* Mobile Nav Button */}
            <button
              className="md:hidden ml-2 p-2 rounded-lg border bordered bg-[var(--card-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-highlight"
              aria-label="Open menu"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
      {/* Mobile Sidebar Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/70"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Sidebar */}
            <motion.div
              key="sidebar"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-64 bg-[var(--card-bg)] text-[var(--text-primary)] shadow-xl flex flex-col p-6 gap-6"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-bold primary-accent">Menu</span>
                <button
                  className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-highlight"
                  aria-label="Close menu"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M6 6l12 12M6 18L18 6" />
                  </svg>
                </button>
              </div>
              <nav className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href === "__profile__" ? (currentUser ? `/profile/${currentUser.id}` : "/auth/login") : item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--background)] transition-colors text-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </a>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
            <div className="flex items-center gap-3">
              {!currentUser ? (
                <div className="hidden sm:flex items-center gap-3">
                  <a
                    href="/auth/login"
                    className="px-3 py-1.5 rounded-lg border font-medium text-sm transition-all bordered hover:highlight"
                  >
                    Sign in
                  </a>
                  <a
                    href="/auth/sign-up"
                    className="px-3 py-1.5 rounded-lg text-sm border font-medium transition-all primary-accent glow-green"
                  >
                    Sign up
                  </a>
                </div>
              ) : (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen((v) => !v)}
                    className="w-9 h-9 rounded-full flex items-center justify-center border backdrop-blur-md card bordered"
                    aria-haspopup="menu"
                    aria-expanded={isProfileMenuOpen}
                  >
                    <Avatar url={currentUser?.user_metadata?.avatar_url} size={32} />
                  </button>
                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 rounded-xl border shadow-lg z-50 overflow-hidden card bordered text-primary backdrop-blur-2xl"
                        style={{ boxShadow: '0 4px 32px 0 rgba(0, 80, 255, 0.10)' }}
                        role="menu"
                      >
                        <div className="px-4 py-3 text-sm text-primary">
                          Signed in as
                          <div className="font-semibold truncate">
                            {currentUser.user_metadata?.username || currentUser.user_metadata?.full_name || currentUser.email}
                          </div>
                        </div>
                        <div className="border-t bordered" />
                        <a
                          href={`/profile/${currentUser.id}`}
                          className="block px-4 py-2 text-sm hover:highlight"
                          role="menuitem"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Profile
                        </a>
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm hover:highlight"
                          role="menuitem"
                        >
                          Log out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </header>



        {/* Theme Toggle Button floating under navbar, top right */}
        <button
          onClick={() => setThemeAndSave(theme === 'light' ? 'dark' : 'light')}
          aria-label="Toggle theme"
          className="fixed z-50 top-25 right-6 p-2 rounded-full border border-transparent hover:highlight bg-transparent flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-highlight transition-colors shadow"
          style={{ pointerEvents: 'auto' }}
        >
          {theme === 'dark' ? (
            <svg className="w-6 h-6 text-primary-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-primary-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="5" />
              <path d="M13 1v2M12 21v2M4.22 4.22l1.42 1.42M18.96 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M19.36 5.64l1.42-1.42" />
            </svg>
          )}
        </button>

        {/* Main Content */}
        <div className="flex flex-col flex-1 h-full relative">

          {/* Main Content Area */}
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 overflow-y-auto transition-all duration-300 relative pt-24 md:pt-28 bg-[var(--background)]"
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