"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "./logout-button";
import { useEffect, useState, useContext } from "react";
import type { User } from "@supabase/supabase-js";
import { ThemeContext } from "@/app/LayoutClient";

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user.user_metadata?.username ?? user.email}!
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button
        asChild
        size="sm"
        className={`bg-transparent border ${
          theme === "dark" ? "border-white" : "border-black"
        }`}
        variant={"outline"}
      >
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button
        asChild
        size="sm"
        className={`bg-transparent border ${
          theme === "dark" ? "border-white" : "border-black"
        }`}
        variant={"default"}
      >
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
