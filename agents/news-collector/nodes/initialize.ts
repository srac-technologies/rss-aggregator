import type { NewsCollectorStateType } from '../state'
import { getSupabaseClient } from '@/agents/shared/database'

export async function initializeRun(state: NewsCollectorStateType): Promise<Partial<NewsCollectorStateType>> {
  try {
    const supabase = getSupabaseClient()

    // Create collection run record
    const { data: run, error: runError } = await supabase
      .from('news_collection_runs')
      .insert({
        source_id: state.sourceId,
        started_at: new Date().toISOString(),
        status: 'running',
      })
      .select('id')
      .single()

    if (runError || !run) {
      return {
        errors: [`Failed to create collection run: ${runError?.message || 'Unknown error'}`],
        shouldContinue: false,
      }
    }

    return {
      runId: run.id,
      startTime: Date.now(),
    }
  } catch (error) {
    console.error('Initialize run error:', error)
    return {
      errors: [`Initialize run failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      shouldContinue: false,
    }
  }
}
