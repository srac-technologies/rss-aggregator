import type { CurationStateType } from '../state'
import { getSupabaseClient } from '@/agents/shared/database'

export async function finalizeRun(state: CurationStateType): Promise<Partial<CurationStateType>> {
  if (!state.runId) {
    return {}
  }

  const supabase = getSupabaseClient()

  try {
    const hasErrors = state.errors.length > 0
    const status = hasErrors ? 'failed' : 'completed'

    // Update run record
    await supabase
      .from('curation_runs')
      .update({
        completed_at: new Date().toISOString(),
        status,
        articles_evaluated: state.articlesEvaluated,
        articles_accepted: state.articlesAccepted,
        articles_rejected: state.articlesRejected,
        curated_article_id: state.curatedArticleId,
        llm_tokens_used: state.tokensUsed,
        error_message: hasErrors ? state.errors.join('; ') : null,
      })
      .eq('id', state.runId)

    // Update agent settings with last run time
    if (state.agentSettings) {
      await supabase
        .from('curation_agent_settings')
        .update({
          last_run_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', state.agentSettings.id)
    }

    return {}
  } catch (error) {
    console.error('Finalize run error:', error)
    return {
      errors: [`Finalize failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
    }
  }
}
