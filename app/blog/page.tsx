import 'server-only'
import Link from 'next/link'
import { ArrowTopRightOnSquareIcon, ClockIcon, PencilSquareIcon, RocketLaunchIcon } from '@heroicons/react/24/outline'
import { createClient as createServerSupabase } from '@/lib/clients/supabase/server'
import { BlogPostCard } from '@/components/app/blog/blog_card'

export const revalidate = 60

export default async function BlogIndexPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page ?? '1'))
  const pageSize = Math.max(1, Number(sp.pageSize ?? '10'))
  const tag = typeof sp.tag === 'string' ? sp.tag.trim() : undefined

  const supabase = await createServerSupabase()

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('blog_posts')
    .select(`
      id,
      created_at,
      title,
      summary,
      tags,
      references,
      body,
      project_blog_links(
        projects(
          id,
          title,
          url
        )
      )
    `, { count: 'exact' })

  if (tag && tag.length > 0) {
    query = query.ilike('tags', `%${tag}%`)
  }

  const { data: posts, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Failed to load blog posts:', error)
  }

  const normalizedPosts = (posts ?? []).map((post) => ({
    ...post,
    relatedProjects: (post.project_blog_links ?? []).flatMap((link) => {
      const project = link.projects
      if (!project) return []
      return Array.isArray(project) ? project : [project]
    }),
  }))

  const totalPages = typeof count === 'number' ? Math.max(1, Math.ceil(count / pageSize)) : 1
  const latestPosts = normalizedPosts.slice(0, 3)
  const makeHref = (p: number) => {
    const params = new URLSearchParams()
    if (tag) params.set('tag', tag)
    params.set('page', String(p))
    params.set('pageSize', String(pageSize))
    return `/blog?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <section className="border-b border-white/10 pb-12">
          <div className="max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm font-medium text-violet-200">
              <PencilSquareIcon className="h-4 w-4" />
              Blog / Build Log
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Public execution, not just polished outcomes.
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              This is where the work stays visible. Project updates, technical notes, experiments, and build thinking all live here so the site feels active, not staged.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <RocketLaunchIcon className="mb-3 h-5 w-5 text-violet-300" />
                <p className="text-sm leading-7 text-slate-300">Use this layer to prove momentum, not just capability.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <ClockIcon className="mb-3 h-5 w-5 text-violet-300" />
                <p className="text-sm leading-7 text-slate-300">Recent posts should make it obvious that projects are alive and evolving.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <ArrowTopRightOnSquareIcon className="mb-3 h-5 w-5 text-violet-300" />
                <p className="text-sm leading-7 text-slate-300">Projects and blog entries should reinforce each other, not feel like separate silos.</p>
              </div>
            </div>
          </div>
        </section>

        {latestPosts.length > 0 && !tag ? (
          <section className="py-10 border-b border-white/10">
            <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-200/70">Recent public execution</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Latest from the Blog / Build Log</h2>
              </div>
              <Link href="/projects" className="text-sm font-medium text-violet-300 hover:text-violet-200">
                Cross-check with Projects →
              </Link>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {latestPosts.map((p) => <BlogPostCard key={p.id} blogPost={p} />)}
            </div>
          </section>
        ) : null}

        <section className="py-10">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">All posts</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
                The archive should read like ongoing proof: technical decisions, experiments, project progress, and what is actually getting built.
              </p>
            </div>
          </div>

          {tag && (
            <div className="mb-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-slate-400">Filtering by:</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-violet-500/15 text-violet-200 border border-violet-400/20">
                {tag}
                <Link
                  href={`/blog?pageSize=${pageSize}`}
                  className="ml-1 hover:text-violet-100"
                  aria-label="Clear filter"
                >
                  ×
                </Link>
              </span>
              <Link
                href="/blog"
                className="text-sm text-slate-400 hover:text-slate-200 underline"
              >
                Clear all filters
              </Link>
            </div>
          )}

          <form method="get" className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-col">
              <label htmlFor="tag" className="text-sm text-slate-300">Filter by tag</label>
              <input
                id="tag"
                name="tag"
                defaultValue={tag ?? ''}
                placeholder="e.g. ai"
                className="rounded border border-white/10 bg-slate-950/60 px-3 py-2 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="pageSize" className="text-sm text-slate-300">Per page</label>
              <select
                id="pageSize"
                name="pageSize"
                defaultValue={String(pageSize)}
                className="rounded border border-white/10 bg-slate-950/60 px-3 py-2 text-white"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </select>
            </div>
            <button type="submit" className="rounded bg-violet-600 px-4 py-2 text-white transition-colors hover:bg-violet-700">
              Apply
            </button>
          </form>

          <section className="space-y-4">
            {normalizedPosts.length ? (
              normalizedPosts.map((p) => <BlogPostCard key={p.id} blogPost={p} />)
            ) : (
              <div className="text-sm text-slate-400">No posts yet.</div>
            )}
          </section>

          <div className="mt-8 flex items-center gap-3 text-slate-300">
            {page > 1 && (
              <Link href={makeHref(page - 1)} className="rounded border border-white/15 px-3 py-2 hover:bg-white/5">Previous</Link>
            )}
            <span className="text-sm">Page {page} {totalPages ? `of ${totalPages}` : ''}</span>
            {page < totalPages && (
              <Link href={makeHref(page + 1)} className="rounded border border-white/15 px-3 py-2 hover:bg-white/5">Next</Link>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
