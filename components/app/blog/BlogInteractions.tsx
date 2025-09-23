"use client";

import { useState, useTransition } from "react";
import { z } from "zod";
import type { Comment as BlogComment } from "@/lib/types/blog";

// -------- Votes (optimistic) --------
export function VoteControls({
  postId,
  initialUp,
  initialDown,
}: {
  postId: number;
  initialUp: number;
  initialDown: number;
}) {
  const [up, setUp] = useState(initialUp);
  const [down, setDown] = useState(initialDown);
  const [current, setCurrent] = useState<"up" | "down" | null>(null);
  const [isPending, startTransition] = useTransition();

  const sendVote = (vote: "up" | "down") => {
    startTransition(async () => {
      // optimistic update
      if (current === vote) {
        // no change
      } else if (current === null) {
        if (vote === "up") {
          setUp((v) => v + 1);
        } else {
          setDown((v) => v + 1);
        }
        setCurrent(vote);
      } else {
        // switch vote
        if (vote === "up") {
          setUp((v) => v + 1);
          setDown((v) => Math.max(0, v - 1));
        } else {
          setDown((v) => v + 1);
          setUp((v) => Math.max(0, v - 1));
        }
        setCurrent(vote);
      }

      try {
        const fd = new FormData();
        fd.set("post_id", String(postId));
        fd.set("vote_type", vote);
        const res = await fetch("/api/votes", {
          method: "POST",
          body: fd,
          // Avoid following redirect response; treat 2xx/3xx as success
          redirect: "manual",
        });
        if (res.status >= 400) {
          throw new Error(`Vote failed (${res.status})`);
        }
      } catch (err) {
        // rollback
        if (current === null) {
          vote === "up" ? setUp((v) => Math.max(0, v - 1)) : setDown((v) => Math.max(0, v - 1));
          setCurrent(null);
        } else if (current !== vote) {
          // we optimistically switched; revert back
          if (vote === "up") {
            setUp((v) => Math.max(0, v - 1));
            setDown((v) => v + 1);
          } else {
            setDown((v) => Math.max(0, v - 1));
            setUp((v) => v + 1);
          }
          // keep current unchanged on rollback
        }
        console.error(err);
      }
    });
  };

  return (
    <div className="mt-8 flex items-center gap-4">
      <button
        type="button"
        onClick={() => sendVote("up")}
        className="px-3 py-1 rounded bg-green-600 text-white disabled:opacity-50"
        disabled={isPending}
      >
        Upvote
      </button>
      <button
        type="button"
        onClick={() => sendVote("down")}
        className="px-3 py-1 rounded bg-red-600 text-white disabled:opacity-50"
        disabled={isPending}
      >
        Downvote
      </button>
      <span className="text-sm text-gray-600">👍 {up} | 👎 {down}</span>
    </div>
  );
}

// -------- Comments (optimistic + zod) --------
const CommentSchema = z.object({
  user_email: z.string().email("Valid email required"),
  content: z.string().min(1, "Comment cannot be empty"),
});

export function CommentsClient({
  postId,
  initial,
}: {
  postId: number;
  initial: BlogComment[];
}) {
  const [comments, setComments] = useState<BlogComment[]>(initial);
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = CommentSchema.safeParse({ user_email: email, content });
    if (!parsed.success) {
      console.error(parsed.error.flatten().fieldErrors);
      return;
    }

    const optimistic: BlogComment = {
      id: Date.now(),
      post_id: postId,
      user_email: email,
      content,
      created_at: new Date().toISOString(),
    };

    // optimistic add
    setComments((prev) => [optimistic, ...prev]);
    setContent("");

    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("post_id", String(postId));
        fd.set("user_email", email);
        fd.set("content", content);
        const res = await fetch("/api/comments", {
          method: "POST",
          body: fd,
          redirect: "manual",
        });
        if (res.status >= 400) throw new Error(`Comment failed (${res.status})`);
      } catch (err) {
        // rollback
        setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
        console.error(err);
      }
    });
  };

  return (
    <section className="mt-10">
      <h2>Comments</h2>
      <form onSubmit={onSubmit} className="mb-6">
        <div className="flex flex-col gap-2">
          <input
            name="user_email"
            type="email"
            required
            placeholder="you@example.com"
            className="border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <textarea
            name="content"
            required
            placeholder="Write a comment…"
            className="border rounded px-3 py-2"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button className="self-start px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50" type="submit" disabled={isPending}>
            Add Comment
          </button>
        </div>
      </form>

      <ul className="space-y-4">
        {comments.map((c) => (
          <li key={c.id} className="border rounded p-3">
            <div className="text-sm text-gray-500">
              {c.user_email} · {new Date(c.created_at).toLocaleString()}
            </div>
            <div className="mt-1 whitespace-pre-wrap">{c.content}</div>
          </li>
        ))}
        {!comments.length && <li className="text-sm text-gray-500">No comments yet.</li>}
      </ul>
    </section>
  );
}
