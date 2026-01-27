import type { NewsCollectorStateType } from '../state'
import { getSupabaseClient } from '@/agents/shared/database'

export async function fetchSource(state: NewsCollectorStateType): Promise<Partial<NewsCollectorStateType>> {
  try {
    const supabase = getSupabaseClient()

    // Fetch source configuration
    const { data: source, error: sourceError } = await supabase
      .from('news_collection_sources')
      .select('*')
      .eq('id', state.sourceId)
      .single()

    if (sourceError || !source) {
      return {
        errors: [`Failed to fetch source: ${sourceError?.message || 'Unknown error'}`],
        shouldContinue: false,
      }
    }

    return {
      source: {
        id: source.id,
        name: source.name,
        type: source.type as 'rss' | 'tavily_search',
        rss_url: source.rss_url,
        tavily_query: source.tavily_query,
        tavily_search_depth: source.tavily_search_depth as 'basic' | 'advanced' | null,
        tavily_days: source.tavily_days,
        auto_tag_enabled: source.auto_tag_enabled || false,
        llm_provider: source.llm_provider as 'anthropic' | 'openai' | null,
        llm_model: source.llm_model,
      },
    }
  } catch (error) {
    console.error('Fetch source error:', error)
    return {
      errors: [`Fetch source failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      shouldContinue: false,
    }
  }
}
