"use client";

import { useEffect, useState, useContext } from "react";
// @ts-ignore
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
import { createClient } from "@/lib/supabase/client";
import { getAvatarUrl } from "@/lib/supabase/avatar";
import { useParams } from "next/navigation";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { fetchSnippetById, fetchComments, fetchCommentCount, addComment, type Snippet, type SnippetComment } from "@/lib/supabase/snippets";
import { motion } from "framer-motion";
import Avatar from "@/components/ui/avatar";
import { ThemeContext } from "@/app/LayoutClient";

export default function SnippetDetailPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [avatarMap, setAvatarMap] = useState<Record<string, string | undefined>>({});
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    })();
  }, []);
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : "";
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<SnippetComment[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [replySubmittingId, setReplySubmittingId] = useState<string | null>(null);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const load = async () => {
      const data = await fetchSnippetById(id);
      setSnippet(data);
      const list = await fetchComments(id);
      setComments(list);
      // Collect all user_ids (snippet author + comment authors)
      const userIds = new Set<string>();
      if (data?.user_id) userIds.add(data.user_id);
      list.forEach(c => c.user_id && userIds.add(c.user_id));
      // Fetch avatar URLs from avatar table using getAvatarUrl util
      let avatarMap: Record<string, string | undefined> = {};
      if (userIds.size > 0) {
        const promises = Array.from(userIds).map(async (userId) => {
          const url = await getAvatarUrl(userId);
          return [userId, url] as [string, string | undefined];
        });
        const results = await Promise.all(promises);
        avatarMap = Object.fromEntries(results);
      }
      setAvatarMap(avatarMap);
      // refresh the counter from DB for this snippet
      const cnt = await fetchCommentCount(id);
      setSnippet(prev => prev ? { ...prev, comments_count: cnt } : prev);
      setLoading(false);
    };
    if (id) load();
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!snippet) return <div className="p-8">Snippet not found</div>;

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-4xl mx-auto">
      <h1 className={`text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-cyber-text' : 'text-light-text'}`}>{snippet.title}</h1>
      <div className="mb-4 flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1">
          <Avatar url={avatarMap[snippet.user_id]} size={32} />
          {snippet.author}
        </span>
        <span>💬 {snippet.comments_count ?? comments.length}</span>
      </div>
      <div className="mb-3 flex justify-end">
        <button
          className={`px-3 py-2 rounded-lg text-sm border ${theme === 'dark' ? 'border-cyber-surface text-cyber-text' : 'border-light-surface text-light-text'}`}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(snippet.code);
              alert('Code copied');
            } catch {
              alert('Failed to copy');
            }
          }}
        >
          📋 Copy
        </button>
      </div>
      <SyntaxHighlighter
        language={snippet.language}
        style={theme === 'dark' ? oneDark : oneLight}
        customStyle={{
          fontFamily: "var(--font-geist-mono)",
          margin: 0,
          borderRadius: "12px",
          background: theme === 'dark' ? "#282C34" : "#f8f8f8",
        }}
        showLineNumbers
      >
        {snippet.code}
      </SyntaxHighlighter>

      <div className="mt-8">
        <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-cyber-text' : 'text-light-text'}`}>Comments</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!commentText.trim()) return;
            setSubmitting(true);
            try {
              const created = await addComment(id, commentText.trim(), replyingTo);
              setComments(prev => [...prev, created]);
              setCommentText("");
              setReplyingTo(null);
            } catch (err) {
              alert('Failed to add comment');
            } finally {
              setSubmitting(false);
            }
          }}
          className="mb-6"
        >
          <textarea
            className={`w-full p-4 rounded-xl backdrop-blur-md border ${theme === 'dark' ? 'bg-cyber-surface/50 border-cyber-surface text-cyber-text' : 'bg-light-surface/50 border-light-surface text-light-text'}`}
            rows={3}
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button
            type="submit"
            disabled={submitting || !commentText.trim()}
            className={`mt-2 px-4 py-2 rounded-lg font-medium border ${theme === 'dark' ? 'bg-cyber-cyan text-white' : 'bg-light-cyan text-white'}`}
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
          {replyingTo && (
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className={`mt-2 ml-3 px-4 py-2 rounded-lg font-medium border ${theme === 'dark' ? 'border-cyber-surface text-cyber-text-muted' : 'border-light-surface text-light-text-muted'}`}
            >
              Cancel Reply
            </button>
          )}
        </form>
        <ul className="space-y-4">
          {buildThread(comments).map((node) => (
            <CommentNode
              key={node.comment.id}
              node={node}
              theme={theme}
              avatarMap={avatarMap}
              replyingTo={replyingTo}
              getReplyText={(cid) => replyTexts[cid] ?? ""}
              isSubmittingId={replySubmittingId}
              onReply={(cid) => {
                setReplyingTo(cid);
              }}
              onReplyTextChange={(cid, value) => setReplyTexts(prev => ({ ...prev, [cid]: value }))}
              onSubmitReply={async (cid) => {
                const text = (replyTexts[cid] ?? "").trim();
                if (!text) return;
                setReplySubmittingId(cid);
                try {
                  const created = await addComment(id, text, cid);
                  setComments(prev => [...prev, created]);
                  setReplyTexts(prev => ({ ...prev, [cid]: "" }));
                  setReplyingTo(null);
                } catch (err) {
                  alert('Failed to add reply');
                } finally {
                  setReplySubmittingId(null);
                }
              }}
              onCancelReply={() => setReplyingTo(null)}
              depth={0}
            />
          ))}
          {comments.length === 0 && (
            <li className={`${theme === 'dark' ? 'text-cyber-text-muted' : 'text-light-text-muted'}`}>No comments yet.</li>
          )}
        </ul>
      </div>
    </motion.main>
  );
}

type ThreadNode = { comment: SnippetComment; children: ThreadNode[] };

function buildThread(comments: SnippetComment[]): ThreadNode[] {
  const map: Record<string, ThreadNode> = {};
  const roots: ThreadNode[] = [];
  comments.forEach(c => { map[c.id] = { comment: c, children: [] }; });
  comments.forEach(c => {
    if (c.parent_id && map[c.parent_id]) {
      map[c.parent_id].children.push(map[c.id]);
    } else {
      roots.push(map[c.id]);
    }
  });
  return roots;
}


function CommentNode({ node, theme, avatarMap, replyingTo, getReplyText, isSubmittingId, onReply, onReplyTextChange, onSubmitReply, onCancelReply, depth = 0 }: {
  node: ThreadNode;
  theme: any;
  avatarMap: Record<string, string | undefined>;
  replyingTo: string | null;
  getReplyText: (id: string) => string;
  isSubmittingId: string | null;
  onReply: (id: string) => void;
  onReplyTextChange: (id: string, value: string) => void;
  onSubmitReply: (id: string) => void;
  onCancelReply: () => void;
  depth?: number;
}) {
  // Avatar size: 36px for top-level, 28px for replies
  const avatarSize = depth === 0 ? 36 : 28;

  return (
    <li className={`${theme === 'dark' ? 'text-cyber-text' : 'text-light-text'} ${depth === 0 ? (theme === 'dark' ? 'bg-cyber-surface/40 border border-cyber-surface rounded-xl p-4' : 'bg-light-surface/40 border border-light-surface rounded-xl p-4') : ''}`}>
      <div className="flex items-center justify-between mb-2 text-xs">
        <span className="flex items-center gap-2">
          <Avatar url={avatarMap[node.comment.user_id]} size={avatarSize} />
          <strong>{node.comment.author || 'Anonymous'}</strong>
          <span className="opacity-60 ml-2">{new Date(node.comment.created_at).toLocaleString()}</span>
        </span>
      </div>
      <div className="whitespace-pre-wrap break-words">{node.comment.content}</div>
      {replyingTo === node.comment.id && (
        <div className="mt-3">
          <textarea
            className={`w-full p-3 rounded-lg backdrop-blur-md border ${theme === 'dark' ? 'bg-cyber-surface/50 border-cyber-surface text-cyber-text' : 'bg-light-surface/50 border-light-surface text-light-text'}`}
            rows={2}
            placeholder="Write a reply..."
            value={getReplyText(node.comment.id)}
            onChange={(e) => onReplyTextChange(node.comment.id, e.target.value)}
          />
          <div className="mt-2 flex gap-2">
            <button
              disabled={isSubmittingId === node.comment.id || !getReplyText(node.comment.id).trim()}
              className={`px-3 py-1 rounded-lg text-sm ${theme === 'dark' ? 'bg-cyber-cyan text-white' : 'bg-light-cyan text-white'}`}
              onClick={() => onSubmitReply(node.comment.id)}
            >
              {isSubmittingId === node.comment.id ? 'Posting...' : 'Reply'}
            </button>
            <button
              className={`px-3 py-1 rounded-lg text-sm border ${theme === 'dark' ? 'border-cyber-surface text-cyber-text-muted' : 'border-light-surface text-light-text-muted'}`}
              onClick={onCancelReply}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {replyingTo !== node.comment.id && (
        <div className="mt-3">
          <button
            className={`px-2 py-1 rounded border text-xs ${theme === 'dark' ? 'border-cyber-surface' : 'border-light-surface'}`}
            onClick={() => onReply(node.comment.id)}
          >
            Reply
          </button>
        </div>
      )}
      {node.children.length > 0 && (
        <ul className={`mt-3 space-y-3 pl-4 border-l border-dashed ${theme === 'dark' ? 'border-cyber-surface' : 'border-light-surface'}`}>
          {node.children.map(child => (
            <CommentNode
              key={child.comment.id}
              node={child}
              theme={theme}
              avatarMap={avatarMap}
              replyingTo={replyingTo}
              getReplyText={getReplyText}
              isSubmittingId={isSubmittingId}
              onReply={onReply}
              onReplyTextChange={onReplyTextChange}
              onSubmitReply={onSubmitReply}
              onCancelReply={onCancelReply}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}


