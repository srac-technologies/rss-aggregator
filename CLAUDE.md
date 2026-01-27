# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RSS Aggregator is a Next.js application that collects news from RSS feeds and Tavily search, uses LLM-powered processing for auto-tagging and filtering, and generates personalized newsletters. Built with Next.js 15, Supabase, LangGraph, and React Email.

## Development Commands

### Next.js Development
```bash
npm run dev              # Start development server at localhost:3000
npm run build            # Production build
npm start                # Start production server
```

### Supabase Database
```bash
npm run supabase:start   # Start local Supabase instance
npm run supabase:stop    # Stop local Supabase instance
npm run supabase:status  # Check Supabase status
npm run db:migrate       # Run database migrations (resets DB)
npm run generate:types   # Generate TypeScript types from DB schema
```

After running migrations, always regenerate types with `npm run generate:types`.

## Architecture

### LangGraph Agent Workflows

The core business logic is implemented as LangGraph workflows in `/agents/`:

**News Collector (`/agents/news-collector/`)**
- Entry point: `runNewsCollector(sourceId: number)`
- Collects news from RSS feeds or Tavily search
- Performs duplicate detection via GUID
- Auto-tags content using LLM (Anthropic or OpenAI)
- Tracks collection metrics and errors
- Invoked by: `/app/api/cron/collect-news/route.ts` (hourly) and `/app/actions/news-sources.ts` (manual)

**Newsletter Generator (`/agents/newsletter/`)**
- Entry point: `runNewsletter(subscriptionId: string)`
- Filters news items using LLM based on user preferences
- Generates newsletter summaries with LLM
- Renders React email templates
- Sends via Resend API
- Tracks token usage and delivery status
- Invoked by: `/app/api/cron/send-newsletters/route.ts` (daily at 9am)

#### Agent Structure Pattern
```
agents/<workflow>/
├── graph.ts          # StateGraph definition and compilation
├── state.ts          # Typed state schema using Annotation API
├── index.ts          # Entry point and exports
├── nodes/            # Pure functions that update state
├── edges/            # Routing functions for conditional flows
└── tools/            # Utility functions and API clients
```

#### Shared Agent Resources
```
agents/shared/
├── database.ts       # Supabase client initialization
├── llm/              # Anthropic and OpenAI clients
└── types.ts          # Shared type definitions
```

### Application Layer

**Next.js App Router** (`/app/`)
- Server components for rendering
- API routes for RSS feeds, cron jobs, tracking pixels
- Server actions in `/app/actions/` for mutations

**Database Layer** (`/lib/`)
- `supabase.ts` - Client-side Supabase client
- `supabase-server.ts` - Server-side Supabase client
- `database.types.ts` - Generated types from DB schema (do not edit manually)

**LLM Clients** (`/lib/llm/`)
- `anthropic-client.ts` - Claude API wrapper with streaming support
- `openai-client.ts` - OpenAI API wrapper with streaming support

Both support auto-tagging and content filtering with structured outputs.

**Email Templates** (`/emails/`)
- React Email components (e.g., `newsletter.tsx`)
- Rendered by agents before sending via Resend

## Database

Supabase PostgreSQL with migrations in `/supabase/migrations/`.

**Key Tables**:
- `news_sources` - RSS feeds and Tavily search configurations
- `news` - Collected news items with content and metadata
- `tags` - Content categories
- `news_tags` - Many-to-many relationship
- `subscriptions` - User newsletter preferences
- `newsletters` - Generated newsletter records
- `collection_runs` - Audit logs for news collection

**Important**: After schema changes, always run `npm run generate:types` to update TypeScript definitions.

## Environment Variables

Required variables (see `.env.local.example`):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# LLM Providers (at least one required)
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# Email
RESEND_API_KEY=

# Search
TAVILY_API_KEY=

# Cron Security
CRON_SECRET=
```

## Cron Jobs

Configured in `vercel.json`:
- `/api/cron/collect-news` - Runs hourly (0 * * * *)
- `/api/cron/send-newsletters` - Runs daily at 9am (0 9 * * *)

Both routes are protected by `CRON_SECRET` header verification.

## Key Patterns

### Agent State Updates
Nodes return partial state updates, not full state:
```typescript
export async function myNode(
  state: MyStateType
): Promise<Partial<MyStateType>> {
  return { fieldToUpdate: newValue }
}
```

### Conditional Routing
Edge functions determine next node based on state:
```typescript
export function myRouter(state: MyStateType): string {
  if (state.condition) return 'node_a'
  return 'node_b'
}
```

### LLM Auto-Tagging
Both Anthropic and OpenAI clients support structured output for tag prediction:
```typescript
const result = await callAnthropicLLM({
  systemPrompt: 'Tag this content',
  userPrompt: content,
  structuredOutput: tagSchema,
})
```

### Server Actions
Use Server Actions in `/app/actions/` for mutations from client components:
```typescript
'use server'
export async function myAction() {
  const supabase = createClient()
  // mutations
}
```

## Path Aliases

TypeScript paths configured with `@/*` for root:
```typescript
import { runNewsCollector } from '@/agents/news-collector'
import { createClient } from '@/lib/supabase'
```

## Notes

- TypeScript strict mode enabled but build errors ignored (`next.config.js`)
- All database types are auto-generated - edit schema, then run `npm run generate:types`
- LangGraph workflows provide better observability and error handling than previous implementations
- Agent workflows are designed for eventual LangSmith integration for monitoring
