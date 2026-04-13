# Build log sync

This project now has two separate GitHub build-log paths:

1. **Notion sync path**
   - script: `scripts/sync-github-build-logs.py`
   - purpose: append new commits from `GioClaw-Edit` into the Notion page `Official build logs/blogs`

2. **Website read path**
   - server reader: `lib/github/latest-pushes.ts`
   - API route: `app/api/github/latest-pushes/route.ts`
   - UI section: `components/app/landing_page/LatestPushesSection.tsx`
   - purpose: render a live latest-pushes section on the website from GitHub API data

## Why split them

This keeps concerns clean:

- Notion sync is a **write flow** with state tracking
- Website latest pushes is a **read flow** with cacheable server rendering

They should not depend on each other.

## Environment

Required for Notion sync:

- `NOTION_API_KEY`

Recommended for both sync and website reliability:

- `GITHUB_TOKEN`

Optional overrides:

- `BUILD_LOG_GITHUB_REPO`
- `BUILD_LOG_GITHUB_BRANCH`
- `BUILD_LOG_NOTION_PAGE_ID`

## Manual run

```bash
python3 scripts/sync-github-build-logs.py
```

## Scheduling

Suggested cron example, every 15 minutes:

```cron
*/15 * * * * cd /path/to/luis_ruiz_2 && /usr/bin/env python3 scripts/sync-github-build-logs.py >> /tmp/luis-ruiz-build-log-sync.log 2>&1
```

Make sure the cron environment has:

- `NOTION_API_KEY`
- `GITHUB_TOKEN` (recommended)
- the optional `BUILD_LOG_*` vars if you override defaults

## Website behavior

- latest pushes are fetched server-side
- revalidated every 10 minutes
- no Notion dependency
- suitable for homepage credibility/proof-of-work display
