# Supabase Schema Report — luis-ruiz

Project: huyhgdsjpdjzokjwaspb (name: luis-ruiz)
Schemas covered: auth, public
Generated: 2025-09-14

This document provides a concise description of each table, notes on how they interact with each other, and the SQL DDL for each table as reflected in your live Supabase project. Row Level Security (RLS) status is included per table.

Note: Some auth-related types are user-defined enums managed by Supabase Auth (e.g., `aal_level`, `code_challenge_method`, `oauth_registration_type`, `one_time_token_type`) and the `vector` type is provided by the `pgvector` extension. These types are referenced directly in the DDL.

---

## Entity & Relationship Overview (high-level)

- auth.users
  - Referenced by:
    - auth.identities.user_id (ON DELETE CASCADE)
    - auth.sessions.user_id (ON DELETE CASCADE)
    - auth.mfa_factors.user_id (ON DELETE CASCADE)
    - auth.one_time_tokens.user_id (ON DELETE CASCADE)
    - public.user_profiles.user_id (NO ACTION)
    - public.responses.user_id (NO ACTION)
- auth.sessions
  - Referenced by:
    - auth.refresh_tokens.session_id (ON DELETE CASCADE)
    - auth.mfa_amr_claims.session_id (ON DELETE CASCADE)
- auth.mfa_factors
  - Referenced by:
    - auth.mfa_challenges.factor_id (ON DELETE CASCADE)
- auth.sso_providers
  - Referenced by:
    - auth.sso_domains.sso_provider_id (ON DELETE CASCADE)
    - auth.saml_providers.sso_provider_id (ON DELETE CASCADE)
    - auth.saml_relay_states.sso_provider_id (ON DELETE CASCADE)
- auth.flow_state
  - Referenced by:
    - auth.saml_relay_states.flow_state_id (ON DELETE CASCADE)
- public.blog_posts
  - Referenced by:
    - public.comments.post_id (ON DELETE CASCADE)
- public.chat_messages
  - Referenced by:
    - public.chat_embeddings.chat_id (ON DELETE CASCADE)
- public.votes
  - Unique per (post_id, user_email)

---

# AUTH Schema

## Table: auth.users
- RLS: enabled
- Description: Auth: Stores user login data within a secure schema.
- Relationships:
  - Referenced by many auth/public tables listed above.

```sql
CREATE TABLE auth.users (
  instance_id uuid NULL,
  id uuid PRIMARY KEY,
  aud varchar NULL,
  role varchar NULL,
  email varchar NULL,
  encrypted_password varchar NULL,
  invited_at timestamptz NULL,
  confirmation_token varchar NULL,
  confirmation_sent_at timestamptz NULL,
  recovery_token varchar NULL,
  recovery_sent_at timestamptz NULL,
  email_change varchar NULL,
  email_change_sent_at timestamptz NULL,
  last_sign_in_at timestamptz NULL,
  raw_app_meta_data jsonb NULL,
  raw_user_meta_data jsonb NULL,
  is_super_admin boolean NULL,
  created_at timestamptz NULL,
  updated_at timestamptz NULL,
  email_confirmed_at timestamptz NULL,
  email_change_token_new varchar NULL,
  phone_confirmed_at timestamptz NULL,
  phone_change_sent_at timestamptz NULL,
  confirmed_at timestamptz GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
  phone text UNIQUE DEFAULT NULL::varchar,
  phone_change text DEFAULT ''::varchar,
  email_change_token_current varchar DEFAULT ''::varchar,
  email_change_confirm_status smallint DEFAULT 0,
  banned_until timestamptz NULL,
  reauthentication_token varchar DEFAULT ''::varchar,
  reauthentication_sent_at timestamptz NULL,
  is_sso_user boolean DEFAULT false,
  deleted_at timestamptz NULL,
  is_anonymous boolean DEFAULT false,
  CONSTRAINT users_email_change_confirm_status_check CHECK (email_change_confirm_status >= 0 AND email_change_confirm_status <= 2)
);
```

---

## Table: auth.refresh_tokens
- RLS: enabled
- Description: Auth: Store of tokens used to refresh JWT tokens once they expire.
- Relationships:
  - FK session_id → auth.sessions(id) ON DELETE CASCADE

```sql
CREATE TABLE auth.refresh_tokens (
  instance_id uuid NULL,
  token varchar UNIQUE,
  user_id varchar NULL,
  revoked boolean NULL,
  created_at timestamptz NULL,
  updated_at timestamptz NULL,
  id bigint PRIMARY KEY DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass),
  parent varchar NULL,
  session_id uuid NULL,
  CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id)
    REFERENCES auth.sessions(id) ON DELETE CASCADE
);
```

---

## Table: auth.instances
- RLS: enabled
- Description: Auth: Manages users across multiple sites.

```sql
CREATE TABLE auth.instances (
  id uuid PRIMARY KEY,
  uuid uuid NULL,
  raw_base_config text NULL,
  created_at timestamptz NULL,
  updated_at timestamptz NULL
);
```

---

## Table: auth.audit_log_entries
- RLS: enabled
- Description: Auth: Audit trail for user actions.

```sql
CREATE TABLE auth.audit_log_entries (
  instance_id uuid NULL,
  id uuid PRIMARY KEY,
  payload json NULL,
  created_at timestamptz NULL,
  ip_address varchar NOT NULL DEFAULT ''::varchar
);
```

---

## Table: auth.schema_migrations
- RLS: enabled
- Description: Auth: Manages updates to the auth system.

```sql
CREATE TABLE auth.schema_migrations (
  version varchar PRIMARY KEY
);
```

---

## Table: auth.identities
- RLS: enabled
- Description: Auth: Stores identities associated to a user.
- Relationships:
  - FK user_id → auth.users(id) ON DELETE CASCADE

```sql
CREATE TABLE auth.identities (
  user_id uuid NOT NULL,
  identity_data jsonb NOT NULL,
  provider text NOT NULL,
  last_sign_in_at timestamptz NULL,
  created_at timestamptz NULL,
  updated_at timestamptz NULL,
  provider_id text NOT NULL,
  email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'))) STORED,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider),
  CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES auth.users(id) ON DELETE CASCADE
);
```

---

## Table: auth.sessions
- RLS: enabled
- Description: Auth: Stores session data associated to a user.
- Relationships:
  - FK user_id → auth.users(id) ON DELETE CASCADE

```sql
CREATE TABLE auth.sessions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  created_at timestamptz NULL,
  updated_at timestamptz NULL,
  factor_id uuid NULL,
  aal aal_level NULL,
  not_after timestamptz NULL,
  CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES auth.users(id) ON DELETE CASCADE
);
```

---

## Table: auth.mfa_factors
- RLS: enabled
- Description: auth: stores metadata about factors
- Relationships:
  - FK user_id → auth.users(id) ON DELETE CASCADE

```sql
CREATE TABLE auth.mfa_factors (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  friendly_name text NULL,
  factor_type factor_type NOT NULL,
  status factor_status NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  secret text NULL,
  phone text NULL,
  last_challenged_at timestamptz NULL,
  web_authn_credential jsonb NULL,
  web_authn_aaguid uuid NULL,
  CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at),
  CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES auth.users(id) ON DELETE CASCADE
);
```

---

## Table: auth.mfa_challenges
- RLS: enabled
- Description: auth: stores metadata about challenge requests made
- Relationships:
  - FK factor_id → auth.mfa_factors(id) ON DELETE CASCADE

```sql
CREATE TABLE auth.mfa_challenges (
  id uuid PRIMARY KEY,
  factor_id uuid NOT NULL,
  created_at timestamptz NOT NULL,
  verified_at timestamptz NULL,
  ip_address inet NOT NULL,
  otp_code text NULL,
  web_authn_session_data jsonb NULL,
  CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id)
    REFERENCES auth.mfa_factors(id) ON DELETE CASCADE
);
```

---

## Table: auth.mfa_amr_claims
- RLS: enabled
- Description: auth: stores authenticator method reference claims for multi factor authentication
- Relationships:
  - FK session_id → auth.sessions(id) ON DELETE CASCADE

```sql
CREATE TABLE auth.mfa_amr_claims (
  session_id uuid NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  authentication_method text NOT NULL,
  id uuid PRIMARY KEY,
  CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method),
  CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id)
    REFERENCES auth.sessions(id) ON DELETE CASCADE
);
```

---

## Table: auth.oauth_clients
- RLS: disabled
- Description: OAuth clients for external apps.

```sql
CREATE TABLE auth.oauth_clients (
  id uuid PRIMARY KEY,
  client_id text NOT NULL,
  client_secret_hash text NOT NULL,
  registration_type oauth_registration_type NOT NULL,
  redirect_uris text NOT NULL,
  grant_types text NOT NULL,
  client_name text NULL,
  client_uri text NULL,
  logo_uri text NULL,
  deleted_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT oauth_clients_client_id_key UNIQUE (client_id),
  CONSTRAINT oauth_clients_client_name_length CHECK (char_length(client_name) <= 1024),
  CONSTRAINT oauth_clients_client_uri_length CHECK (char_length(client_uri) <= 2048),
  CONSTRAINT oauth_clients_logo_uri_length CHECK (char_length(logo_uri) <= 2048)
);
```

---

## Table: auth.one_time_tokens
- RLS: enabled
- Description: One-time tokens (confirmation, recovery, etc.).
- Relationships:
  - FK user_id → auth.users(id) ON DELETE CASCADE

```sql
CREATE TABLE auth.one_time_tokens (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  token_type one_time_token_type NOT NULL,
  token_hash text NOT NULL,
  relates_to text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT one_time_tokens_token_hash_check CHECK (char_length(token_hash) > 0),
  CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES auth.users(id) ON DELETE CASCADE
);
```

---

## Table: auth.sso_providers
- RLS: enabled
- Description: Auth: Manages SSO identity provider information; see saml_providers for SAML.

```sql
CREATE TABLE auth.sso_providers (
  disabled boolean NULL,
  id uuid PRIMARY KEY,
  resource_id text NULL,
  created_at timestamptz NULL,
  updated_at timestamptz NULL,
  CONSTRAINT "resource_id not empty" CHECK ((resource_id = NULL::text OR char_length(resource_id) > 0))
);
```

---

## Table: auth.sso_domains
- RLS: enabled
- Description: Auth: Manages SSO email address domain mapping to an SSO Identity Provider.
- Relationships:
  - FK sso_provider_id → auth.sso_providers(id) ON DELETE CASCADE

```sql
CREATE TABLE auth.sso_domains (
  id uuid PRIMARY KEY,
  sso_provider_id uuid NOT NULL,
  domain text NOT NULL,
  created_at timestamptz NULL,
  updated_at timestamptz NULL,
  CONSTRAINT "domain not empty" CHECK (char_length(domain) > 0),
  CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id)
    REFERENCES auth.sso_providers(id) ON DELETE CASCADE
);
```

---

## Table: auth.saml_providers
- RLS: enabled
- Description: Auth: Manages SAML Identity Provider connections.
- Relationships:
  - FK sso_provider_id → auth.sso_providers(id) ON DELETE CASCADE

```sql
CREATE TABLE auth.saml_providers (
  name_id_format text NULL,
  id uuid PRIMARY KEY,
  sso_provider_id uuid NOT NULL,
  entity_id text NOT NULL,
  metadata_xml text NOT NULL,
  metadata_url text NULL,
  attribute_mapping jsonb NULL,
  created_at timestamptz NULL,
  updated_at timestamptz NULL,
  CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id),
  CONSTRAINT "entity_id not empty" CHECK (char_length(entity_id) > 0),
  CONSTRAINT "metadata_xml not empty" CHECK (char_length(metadata_xml) > 0),
  CONSTRAINT "metadata_url not empty" CHECK ((metadata_url = NULL::text OR char_length(metadata_url) > 0)),
  CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id)
    REFERENCES auth.sso_providers(id) ON DELETE CASCADE
);
```

---

## Table: auth.saml_relay_states
- RLS: enabled
- Description: Auth: Contains SAML Relay State information for each Service Provider initiated login.
- Relationships:
  - FK sso_provider_id → auth.sso_providers(id) ON DELETE CASCADE
  - FK flow_state_id → auth.flow_state(id) ON DELETE CASCADE

```sql
CREATE TABLE auth.saml_relay_states (
  id uuid PRIMARY KEY,
  sso_provider_id uuid NOT NULL,
  request_id text NOT NULL,
  for_email text NULL,
  redirect_to text NULL,
  created_at timestamptz NULL,
  updated_at timestamptz NULL,
  flow_state_id uuid NULL,
  CONSTRAINT "request_id not empty" CHECK (char_length(request_id) > 0),
  CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id)
    REFERENCES auth.sso_providers(id) ON DELETE CASCADE,
  CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id)
    REFERENCES auth.flow_state(id) ON DELETE CASCADE
);
```

---

## Table: auth.flow_state
- RLS: enabled
- Description: stores metadata for pkce logins

```sql
CREATE TABLE auth.flow_state (
  auth_code_issued_at timestamptz NULL,
  id uuid PRIMARY KEY,
  user_id uuid NULL,
  auth_code text NOT NULL,
  code_challenge_method code_challenge_method NOT NULL,
  code_challenge text NOT NULL,
  provider_type text NOT NULL,
  provider_access_token text NULL,
  provider_refresh_token text NULL,
  created_at timestamptz NULL,
  updated_at timestamptz NULL,
  authentication_method text NOT NULL
);
```

---

# PUBLIC Schema

## Table: public.blog_posts
- RLS: disabled
- Relationships:
  - Referenced by public.comments.post_id (ON DELETE CASCADE)

```sql
CREATE TABLE public.blog_posts (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  title text,
  summary text,
  tags text,
  references text,
  body text
);
```

---

## Table: public.comments
- RLS: disabled
- Relationships:
  - FK post_id → public.blog_posts(id) ON DELETE CASCADE

```sql
CREATE TABLE public.comments (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  post_id bigint NOT NULL,
  user_email text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id)
    REFERENCES public.blog_posts(id) ON DELETE CASCADE
);
```

---

## Table: public.votes
- RLS: disabled
- Constraints:
  - UNIQUE (post_id, user_email)
  - CHECK on vote_type ('up' | 'down')

```sql
CREATE TABLE public.votes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  post_id bigint NOT NULL,
  user_email text NOT NULL,
  vote_type text NULL,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_vote_per_user_per_post UNIQUE (post_id, user_email),
  CONSTRAINT votes_vote_type_check CHECK (vote_type = ANY (ARRAY['up'::text, 'down'::text]))
);
```

---

## Table: public.catalog
- RLS: disabled

```sql
CREATE TABLE public.catalog (
  name text NOT NULL,
  description text NULL,
  image_url text NULL,
  options text[] NULL,
  id int PRIMARY KEY DEFAULT nextval('catalog_id_seq'::regclass),
  "Price" real NULL,
  CONSTRAINT catalog_id_key UNIQUE (id)
);
```

---

## Table: public.responses
- RLS: disabled
- Relationships:
  - FK user_id → auth.users(id) (NO ACTION)

```sql
CREATE TABLE public.responses (
  response_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_response text NOT NULL,
  user_id uuid NULL,
  additional_info text NULL,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT responses_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
);
```

---

## Table: public.todos
- RLS: disabled

```sql
CREATE TABLE public.todos (
  description text NOT NULL,
  id int PRIMARY KEY DEFAULT nextval('todos_id_seq'::regclass),
  is_completed boolean DEFAULT false
);
```

---

## Table: public.user_profiles
- RLS: enabled
- Relationships:
  - FK user_id → auth.users(id) (NO ACTION)

```sql
CREATE TABLE public.user_profiles (
  user_id uuid NOT NULL,
  full_name text NULL,
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone text NULL,
  email text NULL,
  address text NULL,
  username text NULL,
  profile_pic_url text NULL,
  bio text NULL,
  birth_date date NULL,
  CONSTRAINT user_profiles_username_key UNIQUE (username),
  CONSTRAINT fk_user_user_id FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
);
```

---

## Table: public.chat_messages
- RLS: disabled
- Relationships:
  - Referenced by public.chat_embeddings.chat_id (ON DELETE CASCADE)

```sql
CREATE TABLE public.chat_messages (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chat_id int NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  embedding vector NULL
);
```

---

## Table: public.chat_embeddings
- RLS: disabled
- Relationships:
  - FK chat_id → public.chat_messages(id) ON DELETE CASCADE

```sql
CREATE TABLE public.chat_embeddings (
  role text NULL,
  embedding vector NULL,
  message text NOT NULL,
  chat_id bigint NOT NULL,
  id int PRIMARY KEY DEFAULT nextval('chat_embeddings_id_seq'::regclass),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT chat_embeddings_chat_id_fkey FOREIGN KEY (chat_id)
    REFERENCES public.chat_messages(id) ON DELETE CASCADE
);
```

---

## Table: public.chat_counter
- RLS: disabled

```sql
CREATE TABLE public.chat_counter (
  id int PRIMARY KEY DEFAULT nextval('chat_counter_id_seq'::regclass),
  last_chat_id int NOT NULL DEFAULT 0
);
```

---

## Table: public.conversations
- RLS: disabled
- Constraints:
  - CHECK role in ('user','assistant')
  - PRIMARY KEY (conversation_id, position_id)

```sql
CREATE TABLE public.conversations (
  position_id int NOT NULL,
  timestamp timestamptz NOT NULL,
  role text NOT NULL,
  message text NOT NULL,
  conversation_id uuid NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT conversations_role_check CHECK (role = ANY (ARRAY['user'::text, 'assistant'::text])),
  CONSTRAINT conversations_pkey PRIMARY KEY (conversation_id, position_id)
);
```

---

## Table: public.site_settings
- RLS: enabled

```sql
CREATE TABLE public.site_settings (
  id int GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  availability boolean NOT NULL DEFAULT true,
  availability_text text NOT NULL DEFAULT 'Available for hire',
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

---

## Table: public.documents
- RLS: disabled

```sql
CREATE TABLE public.documents (
  title text NULL,
  source text NULL,
  url text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NULL,
  content text NULL,
  embedding vector NULL,
  id bigint PRIMARY KEY DEFAULT nextval('documents_id_seq'::regclass)
);
```

---

## Table: public.journal
- RLS: enabled
- Description: This is my personal journal that will appear on my dashboard upon login.

```sql
CREATE TABLE public.journal (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  title text NULL,
  content text NULL,
  tags text NULL,
  CONSTRAINT journal_id_key UNIQUE (id)
);
```

---

## Table: public."journal-chatbot"
- RLS: disabled
- Description: these are the conversations held between Luis and his chatbot

```sql
CREATE TABLE public."journal-chatbot" (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  gio_query text NULL,
  gpt_api_response text NULL
);
```

---

## Table: public.contactlist
- RLS: disabled

```sql
CREATE TABLE public.contactlist (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fullname text NULL,
  phone text NULL,
  email text NULL,
  message text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

---

## Table: public."userInfo"
- RLS: enabled
- Description: names, addresses, etcetera of users

```sql
CREATE TABLE public."userInfo" (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  fullname text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text NULL
);
```

---

# Notes
- RLS policies (if any) are not expanded here; this report only indicates whether RLS is enabled per table.
- Some unique constraints on primary key columns (e.g., `journal_id_key`, `catalog_id_key`) are redundant with the primary key but are included to mirror the live database.
- Vector columns rely on the `pgvector` extension.
- Auth schema enum types are managed by Supabase Auth and referenced as-is.
