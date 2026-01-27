import type { NewsCollectorStateType } from '../state'
import { getSupabaseClient } from '@/agents/shared/database'

export async function updateMetrics(state: NewsCollectorStateType): Promise<Partial<NewsCollectorStateType>> {
  try {
    const supabase = getSupabaseClient()

    // Fetch current source statistics
    const { data: source, error: fetchError } = await supabase
      .from('news_collection_sources')
      .select('total_items_collected')
      .eq('id', state.sourceId)
      .single()

    if (fetchError) {
      return {
        errors: [`Failed to fetch source for metrics update: ${fetchError.message}`],
      }
    }

    // Update source statistics
    const { error: updateError } = await supabase
      .from('news_collection_sources')
      .update({
        last_collected_at: new Date().toISOString(),
        total_items_collected: (source.total_items_collected || 0) + state.itemsNew,
        last_error: state.errors.length > 0 ? state.errors[0] : null,
      })
      .eq('id', state.sourceId)

    if (updateError) {
      return {
        errors: [`Failed to update source metrics: ${updateError.message}`],
      }
    }

    return {}
  } catch (error) {
    console.error('Update metrics error:', error)
    return {
      errors: [`Update metrics failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
    }
  }
}
