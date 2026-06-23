"use client";

import { useState, useTransition } from "react";
import { z } from "zod";
import type { Comment as BlogComment } from "@/lib/types/blog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
      if (current === vote) {
        return;
      } else if (current === null) {
        if (vote === "up") {
          setUp((value) => value + 1);
        } else {
          setDown((value) => value + 1);
        }
        setCurrent(vote);
      } else {
        if (vote === "up") {
          setUp((value) => value + 1);
          setDown((value) => Math.max(0, value - 1));
        } else {
          setDown((value) => value + 1);
          setUp((value) => Math.max(0, value - 1));
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
          redirect: "manual",
        });
        if (res.status >= 400) {
          throw new Error(`Vote failed (${res.status})`);
        }
      } catch (err) {
        if (current === null) {
          if (vote === "up") {
            setUp((value) => Math.max(0, value - 1));
          } else {
            setDown((value) => Math.max(0, value - 1));
          }
          setCurrent(null);
        } else if (current !== vote) {
          if (vote === "up") {
            setUp((value) => Math.max(0, value - 1));
            setDown((value) => value + 1);
          } else {
            setDown((value) => Math.max(0, value - 1));
            setUp((value) => value + 1);
          }
        }
        console.error(err);
      }
    });
  };

  return (
    <div className="mt-8 flex items-center gap-4">
      <Button
        type="button"
        onClick={() => sendVote("up")}
        variant="outline"
        size="sm"
        disabled={isPending}
      >
        Upvote
      </Button>
      <Button
        type="button"
        onClick={() => sendVote("down")}
        variant="outline"
        size="sm"
        disabled={isPending}
      >
        Downvote
      </Button>
      <span className="text-sm text-muted-foreground">
        Up {up} / Down {down}
      </span>
    </div>
  );
}

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

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
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
        setComments((prev) => prev.filter((comment) => comment.id !== optimistic.id));
        console.error(err);
      }
    });
  };

  return (
    <section className="mt-10">
      <h2>Comments</h2>
      <form onSubmit={onSubmit} className="mb-6">
        <div className="flex flex-col gap-2">
          <Input
            name="user_email"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Textarea
            name="content"
            required
            placeholder="Write a comment..."
            rows={3}
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
          <Button className="self-start" type="submit" disabled={isPending}>
            Add Comment
          </Button>
        </div>
      </form>

      <ul className="flex flex-col gap-4">
        {comments.map((comment) => (
          <li key={comment.id} className="rounded-md border p-3">
            <div className="text-sm text-muted-foreground">
              {comment.user_email} / {new Date(comment.created_at).toLocaleString()}
            </div>
            <div className="mt-1 whitespace-pre-wrap">{comment.content}</div>
          </li>
        ))}
        {!comments.length ? (
          <li className="text-sm text-muted-foreground">No comments yet.</li>
        ) : null}
      </ul>
    </section>
  );
}
