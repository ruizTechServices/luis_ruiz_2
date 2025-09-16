import 'server-only'
import { notFound } from 'next/navigation'
import { getPostById, getComments, getVoteCounts } from '@/lib/db/blog'
import type { BlogPost } from '@/lib/types/blog'

export const revalidate = 0

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const idNum = Number(id)
  if (Number.isNaN(idNum)) return notFound()

  const post: BlogPost | null = await getPostById(idNum)
  if (!post) return notFound()

  const [comments, votes] = await Promise.all([
    getComments(idNum),
    getVoteCounts(idNum),
  ])

  return (
    <article className="container mx-auto px-6 py-10 prose dark:prose-invert">
      <h1 className="mb-2">{post.title}</h1>
      <p className="text-sm text-gray-500">
        {post.created_at ? new Date(post.created_at).toLocaleString() : ''}
      </p>

      {post.tags && (
        <div className="flex flex-wrap gap-2 my-4">
          {post.tags.split(',').map((t, i) => (
            <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              {t.trim()}
            </span>
          ))}
        </div>
      )}

      {post.summary && <p className="lead">{post.summary}</p>}
      {post.body && <div className="mt-6 whitespace-pre-wrap">{post.body}</div>}

      {/* Votes */}
      <div className="mt-8 flex items-center gap-4">
        <form action={`/api/votes`} method="post">
          <input type="hidden" name="post_id" value={id} />
          <input type="hidden" name="vote_type" value="up" />
          <button className="px-3 py-1 rounded bg-green-600 text-white" type="submit">Upvote</button>
        </form>
        <form action={`/api/votes`} method="post">
          <input type="hidden" name="post_id" value={id} />
          <input type="hidden" name="vote_type" value="down" />
          <button className="px-3 py-1 rounded bg-red-600 text-white" type="submit">Downvote</button>
        </form>
        <span className="text-sm text-gray-600">👍 {votes.up} | 👎 {votes.down}</span>
      </div>

      {/* Comments */}
      <section className="mt-10">
        <h2>Comments</h2>
        <form action={`/api/comments`} method="post" className="mb-6">
          <input type="hidden" name="post_id" value={id} />
          <div className="flex flex-col gap-2">
            <input
              name="user_email"
              type="email"
              required
              placeholder="you@example.com"
              className="border rounded px-3 py-2"
            />
            <textarea
              name="content"
              required
              placeholder="Write a comment…"
              className="border rounded px-3 py-2"
              rows={3}
            />
            <button className="self-start px-4 py-2 rounded bg-blue-600 text-white" type="submit">
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
    </article>
  )
}
