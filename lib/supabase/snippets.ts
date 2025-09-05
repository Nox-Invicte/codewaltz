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
  likes_count?: number;
  shares_count?: number;
  comments_count?: number;
}

export async function fetchSnippets(): Promise<Snippet[]> {
  const supabase = typeof window === 'undefined' ? await createServerClient() : createClientClient();

  const { data, error } = await supabase
    .from("snippets")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching snippets:", error);
    throw new Error(error.message || "Unknown error");
  }
  
  return data || [];
}

export async function fetchUserSnippets(userId: string): Promise<Snippet[]> {
  const supabase = typeof window === 'undefined' ? await createServerClient() : createClientClient();

  const { data, error } = await supabase
    .from("snippets")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching user snippets:", error);
    throw new Error(error.message || "Unknown error");
  }
  
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

export async function fetchSnippetById(id: string): Promise<Snippet | null> {
  const supabase = typeof window === 'undefined' ? await createServerClient() : createClientClient();
  const { data, error } = await supabase
    .from("snippets")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    console.error("Error fetching snippet by id:", error);
    return null;
  }
  return data as Snippet;
}

export interface SnippetComment {
  avatar_url: string | undefined;
  id: string;
  snippet_id: string;
  user_id: string;
  author?: string;
  content: string;
  created_at: string;
  parent_id?: string | null;
}

export async function fetchComments(snippetId: string): Promise<SnippetComment[]> {
  const supabase = typeof window === 'undefined' ? await createServerClient() : createClientClient();
  const { data, error } = await supabase
    .from("snippet_comments")
    .select("id,snippet_id,user_id,author,content,created_at,parent_id")
    .eq("snippet_id", snippetId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []) as SnippetComment[];
}

export async function addComment(snippetId: string, content: string, parentId?: string | null): Promise<SnippetComment> {
  const supabase = typeof window === 'undefined' ? await createServerClient() : createClientClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  if (!content || content.trim().length === 0) throw new Error("Comment cannot be empty");
  const author = (user.user_metadata && (user.user_metadata.username || user.user_metadata.full_name)) || user.email || 'Anonymous';

  const { data, error } = await supabase
    .from("snippet_comments")
    .insert([{ snippet_id: snippetId, user_id: user.id, author, content, parent_id: parentId ?? null }])
    .select("id,snippet_id,user_id,author,content,created_at,parent_id")
    .single();
  if (error) throw error;
  return data as SnippetComment;
}

export async function fetchCommentCount(snippetId: string): Promise<number> {
  const supabase = typeof window === 'undefined' ? await createServerClient() : createClientClient();
  const { count, error } = await supabase
    .from("snippet_comments")
    .select("id", { count: 'exact', head: true })
    .eq("snippet_id", snippetId);
  if (error) {
    console.error('Error counting comments:', error);
    return 0;
  }
  return count ?? 0;
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

export async function deleteAllSnippets(): Promise<void> {
  const supabase = typeof window === 'undefined' ? await createServerClient() : createClientClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { error } = await supabase
    .from("snippets")
    .delete()
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function likeSnippet(id: string): Promise<Snippet> {
  const supabase = typeof window === 'undefined' ? await createServerClient() : createClientClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id ?? null;

  // Anonymous unique identifier (persists per browser)
  let clientId: string | null = null;
  if (typeof window !== 'undefined') {
    try {
      clientId = window.localStorage.getItem('cw_client_id');
      if (!clientId) {
        clientId = (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
        window.localStorage.setItem('cw_client_id', clientId);
      }
    } catch (_) {
      // ignore storage failures; will fallback to server-side unique enforcement by user only
    }
  }

  // Insert unique like by user or anonymous client
  const { error: likeInsertError } = await supabase
    .from("snippet_likes")
    .insert([{ snippet_id: id, user_id: userId, client_id: clientId }]);

  if (likeInsertError) {
    // If duplicate, don't change count; just return current snippet row
    if ((likeInsertError as any).code === '23505' || (likeInsertError as any).message?.toLowerCase?.().includes('duplicate')) {
      const { data: existing } = await supabase
        .from("snippets")
        .select("*")
        .eq("id", id)
        .single();
      return existing as Snippet;
    }
    throw likeInsertError;
  }

  // Increment counter once for the first like by this user
  const { data: current, error: fetchError } = await supabase
    .from("snippets")
    .select("likes_count")
    .eq("id", id)
    .single();
  if (fetchError) throw fetchError;
  const nextLikes = (current?.likes_count ?? 0) + 1;

  const { data, error } = await supabase
    .from("snippets")
    .update({ likes_count: nextLikes })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Snippet;
}

export async function shareSnippet(id: string): Promise<Snippet> {
  const supabase = typeof window === 'undefined' ? await createServerClient() : createClientClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id ?? null;

  let clientId: string | null = null;
  if (typeof window !== 'undefined') {
    try {
      clientId = window.localStorage.getItem('cw_client_id');
      if (!clientId) {
        clientId = (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
        window.localStorage.setItem('cw_client_id', clientId);
      }
    } catch (_) {}
  }

  const { error: shareInsertError } = await supabase
    .from("snippet_shares")
    .insert([{ snippet_id: id, user_id: userId, client_id: clientId }]);

  if (shareInsertError) {
    if ((shareInsertError as any).code === '23505' || (shareInsertError as any).message?.toLowerCase?.().includes('duplicate')) {
      const { data: existing } = await supabase
        .from("snippets")
        .select("*")
        .eq("id", id)
        .single();
      return existing as Snippet;
    }
    throw shareInsertError;
  }

  const { data: current, error: fetchError } = await supabase
    .from("snippets")
    .select("shares_count")
    .eq("id", id)
    .single();
  if (fetchError) throw fetchError;
  const nextShares = (current?.shares_count ?? 0) + 1;

  const { data, error } = await supabase
    .from("snippets")
    .update({ shares_count: nextShares })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Snippet;
}
