# News Collector Workflow

LangGraph-based workflow for collecting news items from RSS feeds or Tavily search.

## Overview

This workflow handles the complete news collection pipeline:
1. Fetches source configuration
2. Collects items from RSS or Tavily
3. Deduplicates based on GUID
4. Auto-tags with LLM (optional)
5. Tracks metrics and errors

## State Schema

```typescript
interface NewsCollectorState {
  // Input
  sourceId: number

  // Configuration
  source: NewsSource | null

  // Collection tracking
  runId: number | null
  startTime: number

  // Results
  items: NewsItem[]
  itemsFetched: number
  itemsNew: number
  itemsSkipped: number
  tokensUsed: number
  errors: string[]

  // Processing
  currentItemIndex: number
  processedItems: ProcessedItem[]

  // Control
  shouldContinue: boolean
  collectionComplete: boolean
}
```

## Graph Flow

```
START → initialize_run → fetch_source → [route_collector]
                                          ↓
                          [collect_items_rss OR collect_items_tavily]
                                          ↓
                          [should_process_items?]
                                          ↓
                          check_duplicate (loop)
                                          ↓
                          [duplicate?] → [skip OR insert_news]
                                          ↓
                          [auto_tag_enabled?] → [auto_tag OR next]
                                          ↓
                          [has_tags?] → [apply_tags OR next]
                                          ↓
                          update_metrics → finalize_run → END
```

## Nodes

### initialize_run
Creates a collection run record in the database for audit logging.

### fetch_source
Loads the news source configuration from the database.

### collect_items_rss
Parses RSS feed and extracts news items.

### collect_items_tavily
Searches Tavily API and retrieves news items.

### check_duplicate
Checks if an item with the same GUID already exists in the database.

### insert_news
Inserts a new news item into the database.

### auto_tag
Uses LLM to categorize the news item and select relevant tags.

### apply_tags
Applies selected tags to the news item in the database.

### update_metrics
Updates source statistics (total items collected, last error, etc.).

### finalize_run
Completes the collection run record with final metrics and status.

## Conditional Edges

### routeCollector
Routes to the appropriate collector based on source type (RSS or Tavily).

### shouldProcessItems
Decides whether there are items to process or skip to metrics.

### afterCheckDuplicate
Determines if an item should be inserted or skipped based on duplicate check.

### shouldAutoTag
Checks if auto-tagging is enabled for the source.

### shouldApplyTags
Checks if any tags were selected by the LLM.

## Tools

### rss-parser.ts
Wraps the `rss-parser` library to fetch and parse RSS feeds.

### tavily-client.ts
Client for Tavily API to perform news searches.

### llm-tagger.ts
LLM-based auto-tagging using Anthropic or OpenAI models.

## Usage

```typescript
import { runNewsCollector } from '@/agents/news-collector'

const result = await runNewsCollector(sourceId)

if (result.errors.length === 0) {
  console.log(`Successfully collected ${result.itemsNew} new items`)
} else {
  console.error('Collection completed with errors:', result.errors)
}
```

## Adding New Source Types

To add support for a new source type:

1. Update `SourceType` in `agents/shared/types.ts`
2. Create a new collector node in `nodes/`
3. Update `routeCollector` edge to route to the new collector
4. Update the graph in `graph.ts` to include the new node

## Error Handling

All nodes gracefully handle errors and update the `errors` array in state. The workflow continues processing remaining items even if individual items fail.

## Database Schema

**news_collection_sources**
- Source configuration (URL, query, auto-tag settings)

**news_collection_runs**
- Audit log for each collection run

**news**
- News items table

**tags**
- Available tags for categorization

**news_tags**
- Junction table linking news to tags
