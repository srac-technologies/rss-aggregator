// Shared types for agents

export interface NewsItem {
  guid: string
  title: string
  url: string
  content: string
  publishedAt: string
}

export interface ProcessedItem {
  newsId: number
  tagIds: number[]
  tokensUsed: number
}

export type LLMProvider = 'anthropic' | 'openai'
export type SourceType = 'rss' | 'tavily_search'
export type NewsletterFrequency = 'hourly' | 'daily' | 'weekly'
export type NewsletterStatus = 'pending' | 'processing' | 'sent' | 'failed'
