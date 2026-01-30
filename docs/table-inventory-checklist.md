# Supabase Table Inventory Checklist

- [ ] **journal** – Personal journal surfaced on dashboard; 55 rows.
  - Columns: `id bigint identity PK`, `created_at timestamptz default now`, `title text?`, `content text?`, `tags text?`.
  - Indexes: `journal_pkey`, `journal_id_key`.
  - RLS: authenticated-only `SELECT` and `INSERT`.
  - Relationships: none.

- [ ] **journal-chatbot** – Chatbot Q/A log; currently 0 rows.
  - Columns: `id bigint identity PK`, `created_at timestamptz default now`, `gio_query text?`, `gpt_api_response text?`.
  - Indexes: PK only.
  - RLS: disabled.

- [ ] **documents** – Vector knowledge corpus for RAG; 1 row.
  - Columns: `id bigint seq PK`, `content text?`, `embedding vector?`, `title/source/url text?`, `created_at timestamptz default now`, `updated_at timestamptz?`.
  - Indexes: PK + trigram `idx_documents_content_trgm`.
  - RLS: disabled.

- [ ] **contactlist** – Lead/contact capture form; 4 rows.
  - Columns: `id bigint identity always PK`, `created_at timestamptz default now`, name/email/phone/message fields + CRM extras, `newsletter bool default false`.
  - Indexes: PK only.
  - RLS: disabled.

- [ ] **blog_posts** – Blog CMS root; 5 posts.
  - Columns: `id bigint identity PK`, `created_at timestamptz default now`, `title/summary/tags/references/body text?`.
  - Indexes: PK.
  - FKs in: `comments.post_id`, `votes.post_id`.
  - RLS: disabled.

- [ ] **userInfo** – Legacy user directory (1 row); overlaps `user_profiles`.
  - Columns: `id bigint identity PK`, `created_at timestamptz default now`, `fullname/email/phone text`, `address text?`.
  - Indexes: PK.
  - RLS: flag shows enabled but no explicit policies listed.

- [ ] **comments** – Blog comments (2 rows).
  - Columns: `id bigint identity PK`, `post_id bigint FK`, `user_email text`, `content text`, `created_at timestamptz default CURRENT_TIMESTAMP`.
  - Indexes: PK + `comments_post_id_idx`.
  - FKs: `post_id -> blog_posts.id`.

- [ ] **votes** – Blog reactions (3 rows).
  - Columns: `id bigint identity PK`, `post_id bigint FK`, `user_email text`, `vote_type text CHECK IN ('up','down')`, `created_at timestamptz default CURRENT_TIMESTAMP`.
  - Indexes: PK, `votes_post_id_idx`, unique `(post_id, user_email)`.
  - FKs: `post_id -> blog_posts.id`.

- [ ] **catalog** – Empty product/service catalog.
  - Columns: `id int seq PK`, `name text`, `description text?`, `image_url text?`, `options text[]?`, `Price real?` (capitalization inconsistency).
  - Indexes: PK + redundant `catalog_id_key`.
  - RLS: disabled.

- [ ] **responses** – Auth-linked form submissions (0 rows).
  - Columns: `response_id bigint identity PK`, `user_response text`, `created_at timestamptz default CURRENT_TIMESTAMP`, `user_id uuid?`, `additional_info text?`.
  - Indexes: PK.
  - FKs: `user_id -> auth.users.id`.

- [ ] **todos** – Demo/internal task list (54 rows).
  - Columns: `id int seq PK`, `description text`, `is_completed bool default false`.
  - Indexes: PK.
  - RLS: disabled.

- [ ] **user_profiles** – Supabase-auth profile extension (0 rows).
  - Columns: `id uuid default uuid_generate_v4 PK`, `user_id uuid FK`, `full_name/phone/email/address/username/profile_pic_url/bio text?`, `birth_date date?`.
  - Indexes: PK + unique `username`.
  - RLS: insert/select/update restricted to `auth.uid() = user_id`.
  - FKs: `user_id -> auth.users.id`.

- [ ] **chat_messages** – Chat logs with embeddings (36 rows).
  - Columns: `id bigint identity PK`, `chat_id int`, `message text`, `created_at timestamptz default now`, `embedding vector?`.
  - Indexes: PK + HNSW vector index.
  - Relationships: referenced by `chat_embeddings.chat_id`; `chat_id` type mismatch vs bigint FK.

- [ ] **chat_embeddings** – Message embeddings table (26 rows).
  - Columns: `id int seq PK`, `chat_id bigint FK`, `message text`, `created_at timestamptz default now`, `role text?`, `embedding vector?`.
  - Indexes: PK + `idx_chat_embeddings_chat_id`.
  - FKs: `chat_id -> chat_messages.id`.

- [ ] **chat_counter** – Legacy counter (1 row).
  - Columns: `id int seq PK`, `last_chat_id int default 0`.
  - Indexes: PK.

- [ ] **conversations** – Structured conversation history (32 rows).
  - Columns: `conversation_id uuid default gen_random_uuid`, `position_id int`, `timestamp timestamptz`, `role text CHECK IN ('user','assistant')`, `message text`.
  - PK: `(conversation_id, position_id)`.
  - Indexes: PK + btree on `conversation_id`, `position_id`.

- [ ] **site_settings** – Site availability config (1 row).
  - Columns: `id int identity PK`, `availability bool default true`, `availability_text text default 'Available for hire'`, `updated_at timestamptz default now`.
  - Indexes: PK.
  - RLS: public `SELECT` policy.

- [ ] **gios_context** – Context/embedding store (26 rows).
  - Columns: `id bigint identity PK`, `created_at timestamptz default now`, `session_id int?`, `message_id bigint?`, `role text CHECK IN ('user','assistant','system','context')`, `model/source/content text`, `embedding vector`.
  - Indexes: PK + IVFFlat vector index.

- [ ] **projects** – Portfolio projects (6 rows).
  - Columns: `id bigint seq PK`, `url text unique`, `title/description text?`, `created_at timestamptz default now`, `updated_at timestamptz default now`.
  - Indexes: PK + unique `url`.
  - RLS: public `SELECT` policy.
  - Trigger: `projects_set_timestamp` BEFORE UPDATE invokes `set_updated_at()`.

- [ ] **Summary checkpoints**
  - Relationships: blog posts ← comments/votes; chat_messages ↔ chat_embeddings; auth users referenced by user_profiles/responses; multiple vector stores.
  - Cleanup ideas: merge `userInfo` with `user_profiles`, consolidate chat tables, enforce RLS on contact data, fix chat_id type mismatch, consider dropping empty `catalog`, `responses`, `journal-chatbot`, `chat_counter` if unused.
