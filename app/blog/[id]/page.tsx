import 'server-only'
import { notFound } from 'next/navigation'
import { getPostById, getCommentsForPost, getVoteCounts } from '@/lib/db/blog'
import type { BlogPost } from '@/lib/types/blog'
import { renderMarkdownToHtml } from '@/lib/utils/markdown'
import { VoteControls, CommentsClient } from '@/components/app/blog/BlogInteractions'

export const revalidate = 0

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const idNum = Number(id)
  if (Number.isNaN(idNum)) return notFound()

  const post: BlogPost | null = await getPostById(idNum)
  if (!post) return notFound()

  const [comments, votes] = await Promise.all([
    getCommentsForPost(idNum),
    getVoteCounts(idNum),
  ])

  const html = post.body ? await renderMarkdownToHtml(post.body) : ''

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <article className="container mx-auto px-6 py-10 prose dark:prose-invert">
        <h1 className="mb-2 font-bold text-2xl">{post.title}</h1>
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

        {post.summary && <p className="lead prose dark:prose-invert container mx-auto px-6 py-10">{post.summary}</p>}
        <hr className="my-6 w-1/2 mx-auto h-1 bg-gray-200 dark:bg-gray-800"/>
        {post.body && (
          <div className="mt-6 prose dark:prose-invert container mx-auto px-6 py-10" dangerouslySetInnerHTML={{ __html: html }} />
        )}

        {/* Votes (client, optimistic) */}
        <VoteControls postId={idNum} initialUp={votes.up} initialDown={votes.down} />

        {/* Comments (client, optimistic + zod) */}
        <CommentsClient postId={idNum} initial={comments} />
      </article>
    </div>
  )
}
