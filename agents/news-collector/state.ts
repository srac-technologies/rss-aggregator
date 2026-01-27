import { Annotation } from '@langchain/langgraph'
import type { NewsItem, ProcessedItem, LLMProvider, SourceType } from '../shared/types'

// News source configuration from database
export interface NewsSource {
  id: number
  name: string
  type: SourceType
  rss_url: string | null
  tavily_query: string | null
  tavily_search_depth: 'basic' | 'advanced' | null
  tavily_days: number | null
  auto_tag_enabled: boolean
  llm_provider: LLMProvider | null
  llm_model: string | null
}

// Define the state schema for news collector workflow
export const NewsCollectorState = Annotation.Root({
  // Input
  sourceId: Annotation<number>,

  // Source configuration
  source: Annotation<NewsSource | null>({
    reducer: (_, newValue) => newValue,
    default: () => null,
  }),

  // Collection run tracking
  runId: Annotation<number | null>({
    reducer: (_, newValue) => newValue,
    default: () => null,
  }),
  startTime: Annotation<number>({
    reducer: (_, newValue) => newValue,
    default: () => Date.now(),
  }),

  // Collection results
  items: Annotation<NewsItem[]>({
    reducer: (_, newValue) => newValue,
    default: () => [],
  }),
  itemsFetched: Annotation<number>({
    reducer: (_, newValue) => newValue,
    default: () => 0,
  }),
  itemsNew: Annotation<number>({
    reducer: (current, increment) => current + increment,
    default: () => 0,
  }),
  itemsSkipped: Annotation<number>({
    reducer: (current, increment) => current + increment,
    default: () => 0,
  }),
  tokensUsed: Annotation<number>({
    reducer: (current, increment) => current + increment,
    default: () => 0,
  }),
  errors: Annotation<string[]>({
    reducer: (current, newErrors) => [...current, ...newErrors],
    default: () => [],
  }),

  // Processing state
  currentItemIndex: Annotation<number>({
    reducer: (_, newValue) => newValue,
    default: () => 0,
  }),
  processedItems: Annotation<ProcessedItem[]>({
    reducer: (current, newItems) => [...current, ...newItems],
    default: () => [],
  }),

  // Workflow control
  shouldContinue: Annotation<boolean>({
    reducer: (_, newValue) => newValue,
    default: () => true,
  }),
  collectionComplete: Annotation<boolean>({
    reducer: (_, newValue) => newValue,
    default: () => false,
  }),
})

export type NewsCollectorStateType = typeof NewsCollectorState.State
