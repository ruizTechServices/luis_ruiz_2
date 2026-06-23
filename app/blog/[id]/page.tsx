import 'server-only'
import { notFound } from 'next/navigation'
import { getPostById, getCommentsForPost, getVoteCounts } from '@/lib/db/blog'
import type { BlogPost } from '@/lib/types/blog'
import { renderMarkdownToHtml } from '@/lib/utils/markdown'
import { VoteControls, CommentsClient } from '@/components/app/blog/BlogInteractions'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

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
    <main className="min-h-screen bg-background">
      <article className="ss-container py-10">
        <h1 className="mb-2 text-2xl font-semibold tracking-normal">{post.title}</h1>
        <p className="text-sm text-muted-foreground">
          {post.created_at ? new Date(post.created_at).toLocaleString() : ''}
        </p>

        {post.tags && (
          <div className="flex flex-wrap gap-2 my-4">
            {post.tags.split(',').map((t, i) => (
              <Badge key={i} variant="secondary">{t.trim()}</Badge>
            ))}
          </div>
        )}

        {post.summary && <p className="my-6 max-w-3xl text-muted-foreground">{post.summary}</p>}

        {post.relatedProjects && post.relatedProjects.length > 0 ? (
          <div className="my-6 max-w-4xl rounded-md border bg-card p-6">
            <p className="text-xs font-semibold text-muted-foreground">Related projects</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {post.relatedProjects.map((project) => (
                <a
                  key={project.id}
                  href="/projects"
                  className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  {project.title || project.url}
                </a>
              ))}
            </div>
          </div>
        ) : null}

        <Separator className="my-6" />
        {post.body && (
          <div className="prose prose-neutral mt-6 max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: html }} />
        )}

        <VoteControls postId={idNum} initialUp={votes.up} initialDown={votes.down} />

        <CommentsClient postId={idNum} initial={comments} />
      </article>
    </main>
  )
}
