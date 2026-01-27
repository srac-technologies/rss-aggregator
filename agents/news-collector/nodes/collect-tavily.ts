import type { NewsCollectorStateType } from '../state'
import { searchTavily } from '../tools/tavily-client'

export async function collectItemsTavily(state: NewsCollectorStateType): Promise<Partial<NewsCollectorStateType>> {
  try {
    if (!state.source?.tavily_query) {
      return {
        errors: ['Tavily query is required for Tavily source'],
        shouldContinue: false,
      }
    }

    const items = await searchTavily(
      state.source.tavily_query,
      state.source.tavily_search_depth || 'basic',
      state.source.tavily_days || 1,
      20
    )

    return {
      items,
      itemsFetched: items.length,
    }
  } catch (error) {
    console.error('Tavily collection error:', error)
    return {
      errors: [`Tavily collection failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      items: [],
      itemsFetched: 0,
    }
  }
}
