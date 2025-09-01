import { createClient as createServerClient } from "./server";
import { createClient as createClientClient } from "./client";
//import { cookies } from "next/headers";

export interface Snippet {
  id: string;
  title: string;
  language: string;
  code: string;
  author: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export async function fetchSnippets(): Promise<Snippet[]> {
  const supabase = typeof window === 'undefined' ? await createServerClient() : createClientClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("snippets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addSnippet(snippet: Omit<Snippet, "id" | "user_id" | "created_at" | "updated_at">): Promise<Snippet> {
  const supabase = typeof window === 'undefined' ? await createServerClient() : createClientClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("snippets")
    .insert([{ ...snippet, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSnippet(id: string, updates: Partial<Omit<Snippet, "id" | "user_id" | "created_at" | "updated_at">>): Promise<Snippet> {
  const supabase = typeof window === 'undefined' ? await createServerClient() : createClientClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("snippets")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSnippet(id: string): Promise<void> {
  const supabase = typeof window === 'undefined' ? await createServerClient() : createClientClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { error } = await supabase
    .from("snippets")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}
