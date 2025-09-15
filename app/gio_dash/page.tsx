import 'server-only'
import NavBar, { items } from "@/components/app/landing_page/Navbar";
import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client using service role key (server-only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_API_KEY!,
  { auth: { persistSession: false } }
);

// app/gio_dash/page.tsx

export default async function GioDashboard() {
  // Fetch counts using HEAD requests for efficiency
  const [postsRes, commentsRes, votesRes] = await Promise.all([
    supabase.from('blog_posts').select('*', { head: true, count: 'exact' }),
    supabase.from('comments').select('*', { head: true, count: 'exact' }),
    supabase.from('votes').select('*', { head: true, count: 'exact' }),
  ]);

  // Handle any errors but keep UI rendering
  const errors = [postsRes.error, commentsRes.error, votesRes.error].filter(Boolean);
  if (errors.length) {
    console.error('Supabase count errors:', errors);
  }

  const postsCount = postsRes.count ?? 0;
  const commentsCount = commentsRes.count ?? 0;
  const votesCount = votesRes.count ?? 0;

  return (
    <div>
      <NavBar items={items} />

      <h1>Gio Dashboard</h1>
      <p>Posts: {postsCount}</p>
      <p>Comments: {commentsCount}</p>
      <p>Votes: {votesCount}</p>

      {errors.length > 0 && (
        <pre style={{ color: 'crimson', marginTop: 12 }}>
          Encountered errors fetching counts. Check server logs for details.
        </pre>
      )}
    </div>
  );
}
