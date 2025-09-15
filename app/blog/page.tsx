import 'server-only'
import { cookies } from 'next/headers'
import { createClient as createServerClient } from '@/lib/clients/supabase/server'
import { BlogPostCard } from '@/components/app/blog/blog_card'

export const revalidate = 0

export default async function BlogIndexPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)

  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, created_at, title, summary, tags, references, body')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Failed to load blog posts:', error)
  }

  return (
    <main className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>

      <section className="space-y-4">
        {posts?.length ? (
          posts.map((p) => <BlogPostCard key={p.id} blogPost={p} />)
        ) : (
          <div className="text-sm text-gray-500">No posts yet.</div>
        )}
      </section>
    </main>
  )
}
