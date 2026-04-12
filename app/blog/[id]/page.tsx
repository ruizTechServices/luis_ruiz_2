import 'server-only'
import { notFound } from 'next/navigation'
import { getPostById, getCommentsForPost, getVoteCounts } from '@/lib/db/blog'
import type { BlogPost } from '@/lib/types/blog'
import { renderMarkdownToHtml } from '@/lib/utils/markdown'
import { VoteControls, CommentsClient } from '@/components/app/blog/BlogInteractions'

export const revalidate = 60

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

        {post.relatedProjects && post.relatedProjects.length > 0 ? (
          <div className="not-prose mx-auto my-6 max-w-4xl rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-600 dark:text-violet-300">Related project work</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {post.relatedProjects.map((project) => (
                <a
                  key={project.id}
                  href="/projects"
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-violet-300 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-violet-500 dark:hover:text-violet-300"
                >
                  {project.title || project.url}
                </a>
              ))}
            </div>
          </div>
        ) : null}

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
