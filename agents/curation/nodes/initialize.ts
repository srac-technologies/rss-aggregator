import type { CurationStateType } from '../state'
import { getSupabaseClient } from '@/agents/shared/database'

export async function initializeRun(state: CurationStateType): Promise<Partial<CurationStateType>> {
  const supabase = getSupabaseClient()

  try {
    // Fetch agent settings
    const { data: settings, error: settingsError } = await supabase
      .from('curation_agent_settings')
      .select('*')
      .eq('id', state.agentSettingId)
      .single()

    if (settingsError || !settings) {
      return {
        errors: [`Failed to fetch agent settings: ${settingsError?.message || 'Not found'}`],
        shouldContinue: false,
      }
    }

    if (!settings.is_active) {
      return {
        errors: ['Agent is not active'],
        shouldContinue: false,
      }
    }

    // Create curation run record
    const { data: run, error: runError } = await supabase
      .from('curation_runs')
      .insert({
        agent_setting_id: state.agentSettingId,
        status: 'running',
      })
      .select()
      .single()

    if (runError) {
      return {
        errors: [`Failed to create run record: ${runError.message}`],
        shouldContinue: false,
      }
    }

    return {
      agentSettings: {
        id: settings.id,
        name: settings.name,
        magazine_id: settings.magazine_id,
        subscription_id: settings.subscription_id,
        is_active: settings.is_active,
        llm_provider: settings.llm_provider || 'anthropic',
        llm_model: settings.llm_model || 'claude-3-5-haiku-20241022',
        selection_prompt: settings.selection_prompt,
        curation_prompt: settings.curation_prompt,
      },
      subscriptionId: settings.subscription_id,
      runId: run.id,
      startTime: Date.now(),
    }
  } catch (error) {
    console.error('Initialize run error:', error)
    return {
      errors: [`Initialize failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      shouldContinue: false,
    }
  }
}
