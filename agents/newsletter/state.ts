import { Annotation } from '@langchain/langgraph'
import type { LLMProvider, NewsletterFrequency, NewsletterStatus } from '../shared/types'

// Newsletter settings from database
export interface NewsletterSettings {
  id: number
  subscription_id: string
  is_active: boolean
  frequency: NewsletterFrequency
  subject_template: string
  filter_prompt: string
  summary_prompt: string
  llm_provider: LLMProvider
  llm_model: string
  send_time: string | null
  send_day_of_week: number | null
  recipient_email: string
  sender_name: string
}

// News item for filtering
export interface NewsItemForFilter {
  id: number
  title: string
  url: string
  content: string
  published_at: string
}

// Define the state schema for newsletter workflow
export const NewsletterState = Annotation.Root({
  // Input
  subscriptionId: Annotation<string>,

  // Newsletter configuration
  settings: Annotation<NewsletterSettings | null>({
    reducer: (_, newValue) => newValue,
    default: () => null,
  }),

  // News data
  availableNews: Annotation<NewsItemForFilter[]>({
    reducer: (_, newValue) => newValue,
    default: () => [],
  }),
  acceptedNewsIds: Annotation<number[]>({
    reducer: (_, newValue) => newValue,
    default: () => [],
  }),
  rejectedNewsIds: Annotation<number[]>({
    reducer: (_, newValue) => newValue,
    default: () => [],
  }),

  // LLM processing
  filterTokensUsed: Annotation<number>({
    reducer: (_, newValue) => newValue,
    default: () => 0,
  }),
  summaryTokensUsed: Annotation<number>({
    reducer: (_, newValue) => newValue,
    default: () => 0,
  }),
  totalTokensUsed: Annotation<number>({
    reducer: (current, increment) => current + increment,
    default: () => 0,
  }),

  // Content generation
  summaryHtml: Annotation<string>({
    reducer: (_, newValue) => newValue,
    default: () => '',
  }),
  emailHtml: Annotation<string>({
    reducer: (_, newValue) => newValue,
    default: () => '',
  }),

  // Newsletter record
  newsletterId: Annotation<number | null>({
    reducer: (_, newValue) => newValue,
    default: () => null,
  }),
  startTime: Annotation<number>({
    reducer: (_, newValue) => newValue,
    default: () => Date.now(),
  }),
  processingDuration: Annotation<number>({
    reducer: (_, newValue) => newValue,
    default: () => 0,
  }),

  // Email delivery
  emailProviderId: Annotation<string | null>({
    reducer: (_, newValue) => newValue,
    default: () => null,
  }),

  // Workflow control
  error: Annotation<string | null>({
    reducer: (_, newValue) => newValue,
    default: () => null,
  }),
  status: Annotation<NewsletterStatus>({
    reducer: (_, newValue) => newValue,
    default: () => 'pending' as NewsletterStatus,
  }),
})

export type NewsletterStateType = typeof NewsletterState.State
