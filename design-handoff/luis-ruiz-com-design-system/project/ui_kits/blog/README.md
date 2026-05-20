# Blog / Build log UI kit

Hi-fi recreation of `/blog` (index) and `/blog/[id]` (post detail) from [`ruizTechServices/luis_ruiz_2 @ GioClaw-Edit`](https://github.com/ruizTechServices/luis_ruiz_2/tree/GioClaw-Edit).

## Surfaces

- **Index** — eyebrow, hero copy, tag filter chip-bar, featured post, post cards with stats, sticky sidebar (build streak heatmap, tag cloud, recently-shipped list).
- **Detail** — full post view with related-project chips, optimistic Upvote/Downvote, comments form with optimistic add (email + content).

## Sources of truth

- `components/app/blog/blog_card.tsx` — `BlogPostCard` markup
- `components/app/blog/BlogInteractions.tsx` — `VoteControls`, `CommentsClient`
- `app/blog/[id]/page.tsx` — detail page composition
- `app/blog/page.tsx` — index (not pulled verbatim; copy follows the build-log voice)

## Notes

- Code-base original uses **violet** for blog accents (`violet-200/300/500/400` borders/text). I migrated those to **teal** to keep the system-wide accent consistent. Easy to revert if you want violet to stay a blog-only signal.
- Markdown rendering is faked with a small HTML body in the seed data, not the real `renderMarkdownToHtml` pipeline.
- Click any card on the index to open the detail view. The back arrow returns you. Votes and comments are optimistic-local.
