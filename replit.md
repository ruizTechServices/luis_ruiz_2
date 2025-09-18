# Luis-ruiz.com - Next.js AI Chatbot Application

## Project Overview
This is a sophisticated Next.js application featuring AI chatbot capabilities with multiple provider integrations. The app includes a personal portfolio website with blog functionality, contact forms, dashboard components, and an integrated chatbot system.

## Recent Changes (September 18, 2025)
- Successfully imported from GitHub and configured for Replit environment
- Installed all Node.js dependencies (resolved zod version conflicts using --legacy-peer-deps)
- Configured Next.js for Replit proxy compatibility with proper host binding (0.0.0.0:5000)
- Set up development environment with placeholder API keys for initial functionality
- Configured development workflow and deployment settings
- Fixed Next.js configuration warnings for production compatibility

## Project Architecture

### Frontend (Next.js 15 with App Router)
- **Main Pages**: Landing page, Blog, Contact, Projects, Dashboard
- **AI Integration**: Chatbot interface with multiple AI provider support
- **UI Framework**: Tailwind CSS v4 + shadcn/ui components (Radix UI)
- **TypeScript**: Full TypeScript configuration for type safety

### AI Providers Supported
- OpenAI (GPT models)
- Anthropic (Claude)
- Google (Gemini)
- Mistral AI
- HuggingFace
- xAI
- Ollama (local models)

### Database & Services
- **Vector Database**: Pinecone for embedding storage and search
- **Backend Database**: Supabase integration with SSR support
- **File Storage**: Local public assets for images and sounds

### Key Features
- Responsive design with dark/light theme support
- Vector search capabilities for chatbot context
- Blog system with markdown support
- Dashboard with analytics and management tools
- Multi-provider AI client system
- Form handling with react-hook-form and zod validation

## Environment Configuration

### Required Environment Variables
```
# AI API Keys
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GEMINI_API_KEY=your_google_key
MISTRAL_API_KEY=your_mistral_key
HF_API_KEY=your_huggingface_key
XAI_API_KEY=your_xai_key

# Vector Database
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX=chatbot-main-3

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_API_KEY=your_supabase_service_key
```

### Current Status
- Development server runs on port 5000 with proper Replit compatibility
- Cache control headers configured to prevent iframe caching issues
- Deployment configured for autoscale hosting
- All dependencies installed and LSP errors resolved

## Development Workflow
- **Dev Server**: `npm run dev` (configured for 0.0.0.0:5000)
- **Build**: `npm run build`
- **Production**: `npm start`
- **Testing**: `npm test` (custom test runner)

## User Preferences
- Prefers clean, modern design with responsive layouts
- Values AI integration and multi-provider support
- Focuses on performance and user experience
- Maintains TypeScript strict mode for code quality

## Notes
- Some API endpoints may return 500 errors without proper database configuration
- Application core functionality works with placeholder environment variables
- Full functionality requires actual API keys and database setup
- Optimized for Replit's hosting environment with proper proxy support