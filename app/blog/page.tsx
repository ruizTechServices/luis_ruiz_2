import 'server-only'
import Link from 'next/link'
import { createClient as createServerSupabase } from '@/lib/clients/supabase/server'
import { BlogPostCard } from '@/components/app/blog/blog_card'
import NavBar from '@/components/app/landing_page/Navbar'
import { items } from '@/components/app/landing_page/navbarItems'

export const revalidate = 0

export default async function BlogIndexPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page ?? '1'))
  const pageSize = Math.max(1, Number(sp.pageSize ?? '10'))
  const tag = typeof sp.tag === 'string' ? sp.tag.trim() : undefined

  const supabase = createServerSupabase()

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
      <NavBar items={items} />
      <main className="container mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">Blog</h1>

        {/* Filters */}
        <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
          <div className="flex flex-col">
            <label htmlFor="tag" className="text-sm text-gray-600">Filter by tag</label>
            <input id="tag" name="tag" defaultValue={tag ?? ''} placeholder="e.g. ai" className="border rounded px-3 py-2" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="pageSize" className="text-sm text-gray-600">Per page</label>
            <select id="pageSize" name="pageSize" defaultValue={String(pageSize)} className="border rounded px-3 py-2">
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </select>
          </div>
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Apply</button>
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
