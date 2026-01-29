import { Annotation } from '@langchain/langgraph'

// Agent settings from database
export interface CurationAgentSettings {
  id: string
  name: string
  magazine_id: string
  subscription_id: string
  is_active: boolean
  llm_provider: string
  llm_model: string
  selection_prompt: string
  curation_prompt: string
}

// Source article from news table
export interface SourceArticle {
  id: number
  title: string | null
  content: string | null
  url: string | null
  created_at: string
}

// Article evaluation result
export interface ArticleEvaluation {
  article_id: number
  accepted: boolean
  relevance_score: number
  selection_reason: string
}

// Define the state schema for curation workflow
export const CurationState = Annotation.Root({
  // Input
  agentSettingId: Annotation<string>,
  subscriptionId: Annotation<string | null>({
    reducer: (_, newValue) => newValue,
    default: () => null,
  }),

  // Agent configuration
  agentSettings: Annotation<CurationAgentSettings | null>({
    reducer: (_, newValue) => newValue,
    default: () => null,
  }),

  // Run tracking
  runId: Annotation<string | null>({
    reducer: (_, newValue) => newValue,
    default: () => null,
  }),
  startTime: Annotation<number>({
    reducer: (_, newValue) => newValue,
    default: () => Date.now(),
  }),

  // Source articles
  sourceArticles: Annotation<SourceArticle[]>({
    reducer: (_, newValue) => newValue,
    default: () => [],
  }),

  // Evaluation results
  evaluations: Annotation<ArticleEvaluation[]>({
    reducer: (_, newValue) => newValue,
    default: () => [],
  }),
  acceptedArticles: Annotation<SourceArticle[]>({
    reducer: (_, newValue) => newValue,
    default: () => [],
  }),

  // Generated content
  curatedTitle: Annotation<string | null>({
    reducer: (_, newValue) => newValue,
    default: () => null,
  }),
  curatedContent: Annotation<string | null>({
    reducer: (_, newValue) => newValue,
    default: () => null,
  }),
  curatedSummary: Annotation<string | null>({
    reducer: (_, newValue) => newValue,
    default: () => null,
  }),
  curatedArticleId: Annotation<string | null>({
    reducer: (_, newValue) => newValue,
    default: () => null,
  }),

  // Stats
  articlesEvaluated: Annotation<number>({
    reducer: (_, newValue) => newValue,
    default: () => 0,
  }),
  articlesAccepted: Annotation<number>({
    reducer: (_, newValue) => newValue,
    default: () => 0,
  }),
  articlesRejected: Annotation<number>({
    reducer: (_, newValue) => newValue,
    default: () => 0,
  }),
  tokensUsed: Annotation<number>({
    reducer: (current, increment) => current + increment,
    default: () => 0,
  }),

  // Error handling
  errors: Annotation<string[]>({
    reducer: (current, newErrors) => [...current, ...newErrors],
    default: () => [],
  }),

  // Workflow control
  shouldContinue: Annotation<boolean>({
    reducer: (_, newValue) => newValue,
    default: () => true,
  }),
})

export type CurationStateType = typeof CurationState.State
