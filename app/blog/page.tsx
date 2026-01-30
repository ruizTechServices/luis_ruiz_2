import 'server-only'
import Link from 'next/link'
import { createClient as createServerSupabase } from '@/lib/clients/supabase/server'
import { BlogPostCard } from '@/components/app/blog/blog_card'

export const revalidate = 0

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
    .select('id, created_at, title, summary, tags, references, body', { count: 'exact' })

  if (tag && tag.length > 0) {
    query = query.ilike('tags', `%${tag}%`)
  }

  const { data: posts, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Failed to load blog posts:', error)
  }

  const totalPages = typeof count === 'number' ? Math.max(1, Math.ceil(count / pageSize)) : 1
  const makeHref = (p: number) => {
    const params = new URLSearchParams()
    if (tag) params.set('tag', tag)
    params.set('page', String(p))
    params.set('pageSize', String(pageSize))
    return `/blog?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <main className="container mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Blog</h1>

        {/* Active Filter Indicator */}
        {tag && (
          <div className="mb-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600 dark:text-gray-400">Filtering by:</span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300">
              {tag}
              <Link 
                href={`/blog?pageSize=${pageSize}`}
                className="ml-1 hover:text-violet-600 dark:hover:text-violet-200"
                aria-label="Clear filter"
              >
                ×
              </Link>
            </span>
            <Link 
              href="/blog"
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
            >
              Clear all filters
            </Link>
          </div>
        )}

        {/* Filters */}
        <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
          <div className="flex flex-col">
            <label htmlFor="tag" className="text-sm text-gray-600 dark:text-gray-400">Filter by tag</label>
            <input 
              id="tag" 
              name="tag" 
              defaultValue={tag ?? ''} 
              placeholder="e.g. ai" 
              className="border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white" 
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="pageSize" className="text-sm text-gray-600 dark:text-gray-400">Per page</label>
            <select 
              id="pageSize" 
              name="pageSize" 
              defaultValue={String(pageSize)} 
              className="border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </select>
          </div>
          <button type="submit" className="px-4 py-2 rounded bg-violet-600 hover:bg-violet-700 text-white transition-colors">
            Apply
          </button>
        </form>

        <section className="space-y-4">
          {posts?.length ? (
            posts.map((p) => <BlogPostCard key={p.id} blogPost={p} />)
          ) : (
            <div className="text-sm text-gray-500">No posts yet.</div>
          )}
        </section>

        {/* Pagination */}
        <div className="mt-8 flex items-center gap-3">
          {page > 1 && (
            <Link href={makeHref(page - 1)} className="px-3 py-2 rounded border">Previous</Link>
          )}
          <span className="text-sm text-gray-600">Page {page} {totalPages ? `of ${totalPages}` : ''}</span>
          {page < totalPages && (
            <Link href={makeHref(page + 1)} className="px-3 py-2 rounded border">Next</Link>
          )}
        </div>
      </main>
    </div>
  )
}
