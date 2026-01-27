import type { NewsCollectorStateType } from '../state'
import { getSupabaseClient } from '@/agents/shared/database'

export async function finalizeRun(state: NewsCollectorStateType): Promise<Partial<NewsCollectorStateType>> {
  try {
    if (!state.runId) {
      return {
        errors: ['No run ID found for finalization'],
      }
    }

    const supabase = getSupabaseClient()
    const duration = Date.now() - state.startTime

    // Update collection run with final results
    const { error } = await supabase
      .from('news_collection_runs')
      .update({
        status: state.errors.length > 0 ? 'completed_with_errors' : 'completed',
        completed_at: new Date().toISOString(),
        items_fetched: state.itemsFetched,
        items_new: state.itemsNew,
        items_skipped: state.itemsSkipped,
        duration_ms: duration,
        llm_tokens_used: state.tokensUsed,
        error_message: state.errors.length > 0 ? state.errors.join('; ') : null,
      })
      .eq('id', state.runId)

    if (error) {
      return {
        errors: [`Failed to finalize run: ${error.message}`],
      }
    }

    return {
      collectionComplete: true,
    }
  } catch (error) {
    console.error('Finalize run error:', error)
    return {
      errors: [`Finalize run failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      collectionComplete: true,
    }
  }
}
