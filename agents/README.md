# RSS Aggregator LangGraph Agents

This directory contains LangGraph-based workflow implementations for the RSS Aggregator application.

## Overview

The application uses LangGraph to orchestrate complex, multi-step workflows with better observability, state management, and error handling.

## Workflows

### 1. News Collector (`./news-collector`)

Collects news items from RSS feeds or Tavily search, with optional LLM-based auto-tagging.

**Entry Point**: `runNewsCollector(sourceId: number)`

**Workflow Steps**:
1. Initialize collection run (create audit record)
2. Fetch source configuration
3. Collect items (RSS or Tavily)
4. For each item:
   - Check for duplicates
   - Insert new items
   - Auto-tag with LLM (if enabled)
   - Apply tags
5. Update source metrics
6. Finalize collection run

**Key Features**:
- Supports both RSS and Tavily search sources
- Automatic duplicate detection via GUID
- LLM-based auto-tagging (Anthropic/OpenAI)
- Comprehensive error tracking and metrics
- Audit logging for all collection runs

### 2. Newsletter (`./newsletter`)

Processes and sends newsletters with LLM-powered filtering and summarization.

**Entry Point**: `runNewsletter(subscriptionId: string)`

**Workflow Steps**:
1. Fetch newsletter settings
2. Fetch available news items
3. Filter news with LLM
4. Generate summary with LLM
5. Create newsletter record
6. Render email template
7. Send via Resend
8. Update newsletter status

**Key Features**:
- LLM-based news filtering
- LLM-generated newsletter summaries
- React email template rendering
- Email tracking pixel support
- Token usage tracking
- Comprehensive error handling

## Architecture

### State Management

Each workflow uses LangGraph's `Annotation` API to define typed state:

```typescript
export const NewsCollectorState = Annotation.Root({
  sourceId: Annotation<number>,
  items: Annotation<NewsItem[]>({
    reducer: (_, newValue) => newValue,
    default: () => [],
  }),
  // ... more fields
})
```

### Nodes

Nodes are pure functions that receive state and return partial state updates:

```typescript
export async function fetchSource(
  state: NewsCollectorStateType
): Promise<Partial<NewsCollectorStateType>> {
  // Fetch data
  // Return state updates
}
```

### Conditional Edges

Routing functions determine the next node based on current state:

```typescript
export function routeCollector(state: NewsCollectorStateType): string {
  if (state.source?.type === 'rss') return 'collect_items_rss'
  if (state.source?.type === 'tavily_search') return 'collect_items_tavily'
  return 'update_metrics'
}
```

## Directory Structure

```
./agents/
├── news-collector/
│   ├── graph.ts                 # Graph definition and compilation
│   ├── state.ts                 # State schema
│   ├── index.ts                 # Entry point and exports
│   ├── nodes/                   # Node implementations
│   ├── edges/                   # Conditional edge functions
│   └── tools/                   # Utility functions
├── newsletter/
│   ├── graph.ts                 # Graph definition and compilation
│   ├── state.ts                 # State schema
│   ├── index.ts                 # Entry point and exports
│   ├── nodes/                   # Node implementations
│   ├── edges/                   # Conditional edge functions
│   └── tools/                   # Utility functions
└── shared/
    ├── database.ts              # Supabase client
    ├── llm/                     # LLM clients (Anthropic, OpenAI)
    └── types.ts                 # Shared type definitions
```

## Usage

### News Collection

```typescript
import { runNewsCollector } from '@/agents/news-collector'

const result = await runNewsCollector(sourceId)
console.log(`Collected ${result.itemsNew} new items`)
```

### Newsletter Processing

```typescript
import { runNewsletter } from '@/agents/newsletter'

const result = await runNewsletter(subscriptionId)
console.log(`Sent newsletter ${result.newsletterId} with ${result.newsCount} items`)
```

## Testing

Each node can be tested independently by mocking state:

```typescript
import { fetchSource } from './nodes/fetch-source'

const mockState = {
  sourceId: 1,
  // ... other required fields
}

const result = await fetchSource(mockState)
expect(result.source).toBeDefined()
```

## Error Handling

All nodes handle errors gracefully and update state accordingly:

```typescript
try {
  // Node logic
  return { /* success state */ }
} catch (error) {
  console.error('Node error:', error)
  return {
    errors: [`Node failed: ${error.message}`],
    shouldContinue: false,
  }
}
```

## Environment Variables

Required environment variables:

- `ANTHROPIC_API_KEY` - Anthropic API key for Claude models
- `OPENAI_API_KEY` - OpenAI API key for GPT models
- `TAVILY_API_KEY` - Tavily API key for search
- `RESEND_API_KEY` - Resend API key for email sending
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

## Integration

These workflows are integrated into the application via:

- **Cron Routes**: `/app/api/cron/collect-news/route.ts` and `/app/api/cron/send-newsletters/route.ts`
- **Server Actions**: `/app/actions/news-sources.ts` (for manual triggers)

## Future Enhancements

- LangSmith integration for observability
- Checkpointing for long-running workflows
- Parallel processing for multiple sources
- Retry logic with exponential backoff
- Streaming support for real-time updates
