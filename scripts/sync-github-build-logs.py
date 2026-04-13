#!/usr/bin/env python3
import json
import os
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone

REPO = os.environ.get('BUILD_LOG_GITHUB_REPO', 'ruizTechServices/luis_ruiz_2')
BRANCH = os.environ.get('BUILD_LOG_GITHUB_BRANCH', 'GioClaw-Edit')
NOTION_PARENT_PAGE_ID = os.environ.get('BUILD_LOG_NOTION_PAGE_ID', '34161db1-6a30-81e3-a939-c468547cdb7d')
STATE_PATH = os.environ.get('BUILD_LOG_STATE_PATH', 'memory/github-build-log-state.json')
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN') or os.environ.get('GH_TOKEN')
NOTION_API_KEY = os.environ.get('NOTION_API_KEY')

if not NOTION_API_KEY:
    sys.exit('Missing NOTION_API_KEY')


def github_request(url: str):
    headers = {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'luis-ruiz-build-log-sync'
    }
    if GITHUB_TOKEN:
        headers['Authorization'] = f'Bearer {GITHUB_TOKEN}'
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode())


def notion_request(method: str, path: str, payload=None):
    headers = {
        'Authorization': f'Bearer {NOTION_API_KEY}',
        'Notion-Version': '2025-09-03',
        'Content-Type': 'application/json',
    }
    data = None if payload is None else json.dumps(payload).encode()
    req = urllib.request.Request(f'https://api.notion.com/v1{path}', data=data, method=method, headers=headers)
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode())


def load_state():
    if os.path.exists(STATE_PATH):
        with open(STATE_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}


def save_state(state):
    os.makedirs(os.path.dirname(STATE_PATH), exist_ok=True)
    with open(STATE_PATH, 'w', encoding='utf-8') as f:
        json.dump(state, f, indent=2)


def short_sha(sha: str) -> str:
    return sha[:7]


def notion_rich_text(text, url=None, bold=False, code=False):
    return {
        'type': 'text',
        'text': {'content': text, **({'link': {'url': url}} if url else {})},
        'annotations': {
            'bold': bold,
            'italic': False,
            'strikethrough': False,
            'underline': False,
            'code': code,
            'color': 'default'
        }
    }


def make_commit_blocks(commit):
    sha = commit['sha']
    commit_data = commit['commit']
    author = (commit_data.get('author') or {}).get('name', 'unknown')
    date_raw = (commit_data.get('author') or {}).get('date') or (commit_data.get('committer') or {}).get('date')
    dt = datetime.fromisoformat(date_raw.replace('Z', '+00:00')).astimezone(timezone.utc) if date_raw else None
    ts = dt.strftime('%Y-%m-%d %H:%M UTC') if dt else 'unknown time'
    message = commit_data.get('message', '').strip().splitlines()[0] if commit_data.get('message') else '(no message)'
    url = commit.get('html_url', f'https://github.com/{REPO}/commit/{sha}')
    branch_url = f'https://github.com/{REPO}/tree/{urllib.parse.quote(BRANCH, safe="")}'

    return [
        {
            'object': 'block',
            'type': 'bulleted_list_item',
            'bulleted_list_item': {
                'rich_text': [
                    notion_rich_text(short_sha(sha), url=url, code=True),
                    notion_rich_text(' · '),
                    notion_rich_text(message, bold=True),
                    notion_rich_text(f' · {author} · {ts}')
                ]
            }
        },
        {
            'object': 'block',
            'type': 'paragraph',
            'paragraph': {
                'rich_text': [
                    notion_rich_text('Branch: '),
                    notion_rich_text(BRANCH, url=branch_url, code=True)
                ]
            }
        }
    ]


def main():
    state = load_state()
    last_sha = state.get('last_sha')
    commits = github_request(f'https://api.github.com/repos/{REPO}/commits?sha={urllib.parse.quote(BRANCH, safe="")}&per_page=10')
    if not isinstance(commits, list) or not commits:
        print('No commits returned')
        return

    new_commits = []
    for commit in commits:
        if commit['sha'] == last_sha:
            break
        new_commits.append(commit)

    if not new_commits:
        print('No new commits to sync')
        return

    new_commits.reverse()
    children = []
    for commit in new_commits:
        children.extend(make_commit_blocks(commit))

    notion_request('PATCH', f'/blocks/{NOTION_PARENT_PAGE_ID}/children', {'children': children})
    state['last_sha'] = commits[0]['sha']
    state['last_synced_at'] = datetime.now(timezone.utc).isoformat()
    state['repo'] = REPO
    state['branch'] = BRANCH
    save_state(state)
    print(f'Synced {len(new_commits)} commit(s) to Notion')


if __name__ == '__main__':
    main()
