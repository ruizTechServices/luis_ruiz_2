# Luis-ruiz.com

The personal portfolio website of **Gio (Luis Giovanni Ruiz)** - a Bronx-born, bilingual full-stack AI engineer and founder of RuizTechServices LLC (est. 2024). This Next.js-powered site showcases Gio's expertise in AI engineering, his flagship product 24Hour-AI, and his proficiency across multiple programming languages and frameworks.

## About Gio

Gio specializes in scalable AI infrastructure and enterprise-grade solutions that deliver measurable business value. His flagship product **24Hour-AI** is a high-performance LLM platform achieving:
- Sub-200ms latency
- 99.9% uptime
- 30% cost optimization
- Support for 100+ concurrent users

## Portfolio Features

- **Personal Portfolio**: Professional landing page showcasing skills and experience
- **Blog System**: Personal blog with markdown support and interactive features
- **Project Showcase**: Display of technical projects and achievements
- **Dashboard**: Administrative interface for content management
- **AI Integration**: Multiple AI provider support showcasing technical expertise
- **Contact System**: Professional contact forms and availability status
- **Skills Display**: Interactive showcase of programming languages and frameworks

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript.
- **Styling**: Tailwind CSS v4, shadcn/ui (Radix UI), `lucide-react`.
- **AI SDKs**: `openai`, `@anthropic-ai/sdk`, `@mistralai/mistralai`, `@google/generative-ai`, `@huggingface/inference`, xAI (OpenAI-compatible), & [new]`ollama`.
- **Vector Database**: Pinecone JS v6; default index `chatbot-main-3`, namespace `first-user-1`.
- **Supabase**: `@supabase/ssr` helpers (browser/server/middleware) present.
- **Forms**: `react-hook-form` and `zod` are installed; not used in UI yet.

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create `.env.local` from `.env.example` and fill values. Minimum for core features:
   ```
   OPENAI_API_KEY=...
   PINECONE_API_KEY=...
   GEMINI_API_KEY=...           # optional (Google)
   MISTRAL_API_KEY=...          # optional
   ANTHROPIC_API_KEY=...        # optional
   HF_API_KEY=...               # optional
   XAI_API_KEY=...              # optional
   NEXT_PUBLIC_SUPABASE_URL=... # optional (Supabase helpers)
   NEXT_PUBLIC_SUPABASE_ANON_KEY=... # optional
   ```
   Notes:
   - `PINECONE_INDEX` and `SUPABASE_API_KEY` exist in `.env.example` but are not used by the current code.
   - Pinecone index name is hardcoded in `lib/clients/pinecone/client.ts` as `chatbot-main-3`.
4. Run the development server:
   ```
   npm run dev
   ```
5. Optional tests (require corresponding API keys):
   ```
   npx tsx tests/testChunkText.ts
   npx tsx tests/testEmbeddings.ts
   npx tsx tests/testResponses.ts
   npx tsx tests/testUpsert.ts
   npx tsx tests/testQuery.ts
   npx tsx tests/testClients.ts
   ```

## Project Structure

- `/app` - Next.js app router pages
- `/components` - Reusable UI components
- `/lib` - Utility functions and API clients
- `/tests` - Test files for various functionalities

## Available Routes

- `/` - Personal portfolio landing page
- `/blog` - Personal blog and articles
- `/projects` - Project showcase and portfolio
- `/contact` - Professional contact information
- `/gio_dash` - Administrative dashboard
_