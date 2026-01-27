import type { NewsItem } from '@/agents/shared/types'

export interface TavilySearchResult {
  title: string
  url: string
  content: string
  publishedDate?: string
  score?: number
}

export interface TavilySearchParams {
  query: string
  searchDepth?: 'basic' | 'advanced'
  maxResults?: number
  days?: number
  includeRawContent?: boolean
}

export class TavilyClient {
  private apiKey: string
  private baseUrl = 'https://api.tavily.com'

  constructor() {
    const apiKey = process.env.TAVILY_API_KEY
    if (!apiKey) {
      throw new Error('TAVILY_API_KEY environment variable is not set')
    }
    this.apiKey = apiKey
  }

  async search(params: TavilySearchParams): Promise<TavilySearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          query: params.query,
          search_depth: params.searchDepth || 'basic',
          max_results: params.maxResults || 10,
          days: params.days || 1,
          include_raw_content: params.includeRawContent || false,
          include_domains: [],
          exclude_domains: [],
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Tavily API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()

      if (!data.results || !Array.isArray(data.results)) {
        return []
      }

      return data.results.map((result: any) => ({
        title: result.title || '',
        url: result.url || '',
        content: result.content || '',
        publishedDate: result.published_date,
        score: result.score,
      }))
    } catch (error) {
      console.error('Tavily API error:', error)
      throw error
    }
  }
}

// Singleton instance
let tavilyClient: TavilyClient | null = null

export function getTavilyClient(): TavilyClient {
  if (!tavilyClient) {
    tavilyClient = new TavilyClient()
  }
  return tavilyClient
}

export async function searchTavily(
  query: string,
  searchDepth: 'basic' | 'advanced' = 'basic',
  days: number = 1,
  maxResults: number = 20
): Promise<NewsItem[]> {
  const client = getTavilyClient()
  const results = await client.search({
    query,
    searchDepth,
    maxResults,
    days,
  })

  return results.map((result) => ({
    guid: result.url,
    title: result.title,
    url: result.url,
    content: result.content,
    publishedAt: result.publishedDate
      ? new Date(result.publishedDate).toISOString()
      : new Date().toISOString(),
  }))
}
