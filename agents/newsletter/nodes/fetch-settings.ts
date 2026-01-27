import type { NewsletterStateType } from '../state'
import { getSupabaseClient } from '@/agents/shared/database'

export async function fetchSettings(state: NewsletterStateType): Promise<Partial<NewsletterStateType>> {
  try {
    const supabase = getSupabaseClient()

    // Fetch newsletter settings
    const { data: settings, error } = await supabase
      .from('newsletter_settings')
      .select('*')
      .eq('subscription_id', state.subscriptionId)
      .eq('is_active', true)
      .single()

    if (error || !settings) {
      return {
        error: `Newsletter settings not found: ${error?.message || 'No active settings'}`,
        status: 'failed',
      }
    }

    return {
      settings: {
        id: settings.id,
        subscription_id: settings.subscription_id,
        is_active: settings.is_active || false,
        frequency: (settings.frequency as 'hourly' | 'daily' | 'weekly') || 'daily',
        subject_template: settings.subject_template || 'Your Newsletter - {{date}}',
        filter_prompt: settings.filter_prompt || '',
        summary_prompt: settings.summary_prompt || '',
        llm_provider: (settings.llm_provider as 'anthropic' | 'openai') || 'anthropic',
        llm_model: settings.llm_model || 'claude-3-5-sonnet-20241022',
        send_time: settings.send_time,
        send_day_of_week: settings.send_day_of_week,
        recipient_email: settings.recipient_email || '',
        sender_name: settings.sender_name || 'RSS Aggregator',
      },
    }
  } catch (error) {
    console.error('Fetch settings error:', error)
    return {
      error: `Fetch settings failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      status: 'failed',
    }
  }
}
