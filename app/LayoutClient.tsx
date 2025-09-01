/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable @next/next/no-img-element */
'use client';

declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: {
      [key: string]: unknown;
    };
  }
}

import { createContext, useState, useEffect } from "react";
import "./globals.css";
import { UserInfo } from "@/components/user-info";

// Create ThemeContext
export const ThemeContext = createContext<{
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}>({
  theme: "light",
  setTheme: () => {},
});

const themeBackgrounds: Record<"light" | "dark", string> = {
  light: "bg-[linear-gradient(135deg,_rgb(0,105,209),_rgb(0,255,128))] text-[rgb(33,0,0)]",
  dark: "bg-[linear-gradient(270deg,_rgb(95,0,150),_rgba(95,0,250,1))] text-white",
};

export default function LayoutClient({
  children,
  geistSans,
  geistMono,
}: {
  children: React.ReactNode;
  geistSans: string;
  geistMono: string;
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isMounted, setIsMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
    setIsMounted(true);

    // Disable React DevTools in production
    if (process.env.NODE_ENV === "production") {
      if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === "object") {
        for (const [key, value] of Object.entries(
          window.__REACT_DEVTOOLS_GLOBAL_HOOK__
        )) {
          window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] =
            typeof value === "function" ? () => {} : null;
        }
      }

      // Disable right-click context menu
      const disableContextMenu = (e: Event) => e.preventDefault();
      window.addEventListener("contextmenu", disableContextMenu);

      // Disable certain keyboard shortcuts
      const disableShortcuts = (e: KeyboardEvent) => {
        // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (
          e.key === "F12" ||
          (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) ||
          (e.ctrlKey && e.key === "U")
        ) {
          e.preventDefault();
        }
      };
      window.addEventListener("keydown", disableShortcuts);

      // Cleanup event listeners on unmount
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
  };

  if (!isMounted) {
    // Prevent rendering until theme is loaded to avoid flash of light theme
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeAndSave }}>
      <div
        className={`flex h-screen w-screen max-w-full max-h-full overflow-hidden ${geistSans} ${geistMono} relative`}
      >
        <div className="overflow-hidden max-w-[300px] relative">
          <aside
            className={`relative z-10 w-60 h-full ${themeBackgrounds[theme]} border-black border-5 overflow-auto shadow-lg`}
          >
            <h1 className="text-4xl font-bold text-center text-white bg-black py-7">
              <a href="/" className="relative inline-block text-white group">
                <span className="block transition-opacity duration-300 group-hover:opacity-0">
                  CodeWaltz
                </span>
                <img
                  src="/favicon.jpeg"
                  alt="favicon"
                  className="absolute top-1/2 left-1/2 w-32 h-18 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
              </a>
            </h1>
            <ul className="flex flex-col py-10 items-center justify-center">
              <li className="text-lg py-5 hover:scale-115 transition-transform duration-300">
                <a
                  className="text-3xl font-bold px-5 py-3 rounded-md"
                  href="/"
                >
                  Home
                </a>
              </li>
              <li className="text-lg py-5 hover:scale-115 transition-transform duration-300">
                <a
                  className="text-3xl font-bold px-5 py-3 rounded-md"
                  href="/snippets"
                >
                  Snippets
                </a>
              </li>
              <li className="text-lg py-5 hover:scale-115 transition-transform duration-300">
                <a
                  className="text-3xl font-bold px-5 py-3 rounded-md"
                  href="/settings"
                >
                  Settings
                </a>
              </li>
              <li className="text-lg py-5 hover:scale-115 transition-transform duration-300">
                <a
                  className="text-3xl font-bold px-5 py-3 rounded-md"
                  href="/about"
                >
                  About
                </a>
              </li>
            </ul>
            <div className="absolute bottom-0 w-full">
              {/* User info display at bottom of sidebar */}
              <UserInfo />
            </div>
          </aside>
        </div>
        <div className="flex flex-col flex-1 h-full relative">
          <label
            htmlFor="theme-toggle"
            className="absolute top-4 right-4 cursor-pointer select-none px-5 z-20 flex items-center space-x-2"
          >
            <svg
              className={`w-5 h-5 text-red-800 transition-opacity duration-500 ${
                theme === "light" ? "opacity-100" : "opacity-0"
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></circle>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 1v2M12 21v2M4.22 4.22l1.42 1.42M18.96 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M19.36 5.64l1.42-1.42"
              ></path>
            </svg>
            <input
              id="theme-toggle"
              type="checkbox"
              className="theme-checkbox"
              checked={theme === "dark"}
              onChange={() => setThemeAndSave(theme === "light" ? "dark" : "light")}
              aria-label="Toggle theme"
            />
            <svg
              className={`w-5 h-5 text-gray-300 transition-opacity duration-500 ${
                theme === "dark" ? "opacity-100" : "opacity-0"
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"
              ></path>
            </svg>
          </label>
          <main className={`flex-1 overflow-y-auto ${themeBackgrounds[theme]}`}>
            {children}
          </main>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}