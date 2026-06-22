-- Return blog posts with aggregated comments and vote totals.
create or replace function public.get_blog_posts_with_stats()
returns table (
  id bigint,
  created_at timestamptz,
  title text,
  summary text,
  tags text,
  "references" text,
  body text,
  comment_count bigint,
  up_votes bigint,
  down_votes bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    bp.id,
    bp.created_at,
    bp.title,
    bp.summary,
    bp.tags,
    bp.references,
    bp.body,
    coalesce(c.cnt, 0)::bigint as comment_count,
    coalesce(v.up_cnt, 0)::bigint as up_votes,
    coalesce(v.down_cnt, 0)::bigint as down_votes
  from public.blog_posts bp
  left join lateral (
    select count(*) as cnt
    from public.comments
    where comments.post_id = bp.id
  ) c on true
  left join lateral (
    select
      count(*) filter (where vote_type = 'up') as up_cnt,
      count(*) filter (where vote_type = 'down') as down_cnt
    from public.votes
    where votes.post_id = bp.id
  ) v on true
  order by bp.created_at desc;
$$;
