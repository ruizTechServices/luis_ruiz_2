-- get_blog_posts_with_stats
-- Returns all blog posts with aggregated comment counts and vote counts
-- in a single query instead of 3 separate queries (N+1 fix).
create or replace function public.get_blog_posts_with_stats()
returns table (
  id int,
  created_at timestamptz,
  title text,
  summary text,
  tags text[],
  "references" text[],
  body text,
  comment_count bigint,
  up_votes bigint,
  down_votes bigint
)
language sql stable as $$
  select
    bp.id,
    bp.created_at,
    bp.title,
    bp.summary,
    bp.tags,
    bp.references,
    bp.body,
    coalesce(c.cnt, 0) as comment_count,
    coalesce(v.up_cnt, 0) as up_votes,
    coalesce(v.down_cnt, 0) as down_votes
  from blog_posts bp
  left join lateral (
    select count(*) as cnt
    from comments
    where comments.post_id = bp.id
  ) c on true
  left join lateral (
    select
      count(*) filter (where vote_type = 'up') as up_cnt,
      count(*) filter (where vote_type = 'down') as down_cnt
    from votes
    where votes.post_id = bp.id
  ) v on true
  order by bp.created_at desc;
$$;
