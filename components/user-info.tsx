"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "./logout-button";
import { useEffect, useState, useContext } from "react";
import type { User } from "@supabase/supabase-js";
import { ThemeContext } from "@/app/LayoutClient";

export function UserInfo() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const supabase = createClient();

    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
      setLoading(false);
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event: string, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`text-center py-4 ${
          theme === 'dark' ? 'text-cyber-text-muted' : 'text-light-text-muted'
        }`}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="inline-block"
        >
          ⚡
        </motion.div>
        <span className="ml-2">Loading...</span>
      </motion.div>
    );
  }

  return user ? (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-3 py-4"
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`px-4 py-2 rounded-xl backdrop-blur-md border transition-all duration-300 ${
          theme === 'dark'
            ? 'bg-cyber-surface/50 border-cyber-cyan/30 text-cyber-text hover:border-cyber-cyan hover:bg-cyber-surface/80'
            : 'bg-light-surface/50 border-light-cyan/30 text-light-text hover:border-light-cyan hover:bg-light-surface/80'
        }`}
      >
        <Link href={`/profile/${user.id}`} className="block text-sm font-medium">
          <div className="flex items-center space-x-2">
            <motion.span
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              👤
            </motion.span>
            <span>{user.user_metadata?.username ?? user.email?.split('@')[0]}</span>
          </div>
        </Link>
      </motion.div>
      <LogoutButton />
    </motion.div>
  ) : (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 py-4"
    >
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Link
          href="/auth/login"
          className={`block w-40 mx-auto px-4 py-2 rounded-xl text-center font-medium transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-cyber-red text-white hover:bg-cyber-red/80 shadow-lg shadow-cyber-red/25'
              : 'bg-light-red text-white hover:bg-light-red/80 shadow-lg shadow-light-red/25'
          }`}
        >
          Sign in
        </Link>
      </motion.div>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Link
          href="/auth/sign-up"
          className={`block w-40 mx-auto px-4 py-2 rounded-xl text-center font-medium border transition-all duration-300 ${
            theme === 'dark'
              ? 'border-cyber-purple text-cyber-purple hover:bg-cyber-purple/10 hover:border-cyber-purple/50'
              : 'border-light-purple text-light-purple hover:bg-light-purple/10 hover:border-light-purple/50'
          }`}
        >
          Sign up
        </Link>
      </motion.div>
    </motion.div>
  );
}
