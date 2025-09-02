"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "./logout-button";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export function UserInfo() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
    return <div className="text-center py-4">Loading...</div>;
  }

  return user ? (
    <div className="flex flex-col items-center gap-2 py-4">
      <Button className="text-sm text-center">
        <Link href={`/profile/${user.id}`}>
          {user.user_metadata?.username ?? user.email?.split('@')[0]}
        </Link>
      </Button>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex flex-col gap-2 py-4">
      <Button asChild size="sm" variant={"default"} className="w-40 mx-auto">
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"} className="w-40 mx-auto">
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
