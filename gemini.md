# Gemini Project Configuration

This file provides project-specific context and instructions for the Gemini agent.

## Project Overview

This is a Next.js (React) project using TypeScript. It appears to be a personal portfolio website for "Luis Ruiz", which includes a blog, a projects section, and a contact form. The project also features several API routes for interacting with various services, including AI models (like Ollama and OpenAI) and a database (likely Supabase).

## Key Technologies

- **Framework:** Next.js
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (based on the file structure and dependencies)
- **Database/Auth:** Supabase
- **AI Integrations:** OpenAI, Anthropic, Google Gemini, Mistral, Hugging Face, Ollama
- **Vector Database:** Pinecone

## Commands

- **Run development server:** `npm run dev`
- **Create production build:** `npm run build`
- **Start production server:** `npm run start`
- **Lint code:** `npm run lint`
- **Run tests:** `npm run test`

## Instructions & Conventions

- Use `C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2` as the absolute path for all file operations.
- Adhere to the existing coding style, including the use of TypeScript and existing component structures.
- For new UI, use components from `components/ui` where possible.
- For new AI integrations, use the existing AI integration patterns as a reference.
- For new database integrations, use the existing database integration patterns as a reference.
- For new vector database integrations, use the existing vector database integration patterns as a reference.
- For new authentication integrations, use the existing authentication integration patterns as a reference.
- For new storage integrations, use the existing storage integration patterns as a reference.
- For new storing new components, save them to `components/app/{section name(ie. blog, projects, contact)}/{component name}.tsx`.
- Modularization is KEY! Respect Separation of Concerns.
- API routes are located in `app/api/`.
- All tests are located in the `tests/` directory and are run with `npm run test`.
