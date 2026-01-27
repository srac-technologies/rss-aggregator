import type { NewsletterStateType } from '../state'
import { getSupabaseClient } from '@/agents/shared/database'

export async function createNewsletter(state: NewsletterStateType): Promise<Partial<NewsletterStateType>> {
  try {
    if (!state.settings) {
      return {
        error: 'Settings not loaded',
        status: 'failed',
      }
    }

    const supabase = getSupabaseClient()
    const duration = Date.now() - state.startTime

    // Create newsletter record
    const { data: newsletter, error } = await supabase
      .from('newsletter_sends')
      .insert({
        subscription_id: state.subscriptionId,
        newsletter_settings_id: state.settings.id,
        recipient_email: state.settings.recipient_email,
        subject: state.settings.subject_template.replace('{{date}}', new Date().toLocaleDateString()),
        status: 'pending',
        html_content: '',
        summary_content: state.summaryHtml,
        news_ids: state.acceptedNewsIds,
        news_count: state.acceptedNewsIds.length,
        llm_tokens_used: state.totalTokensUsed,
        processing_duration_ms: duration,
      })
      .select('id')
      .single()

    if (error || !newsletter) {
      return {
        error: `Failed to create newsletter: ${error?.message || 'Unknown error'}`,
        status: 'failed',
      }
    }

    return {
      newsletterId: newsletter.id,
      processingDuration: duration,
      status: 'processing',
    }
  } catch (error) {
    console.error('Create newsletter error:', error)
    return {
      error: `Create newsletter failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      status: 'failed',
    }
  }
}
