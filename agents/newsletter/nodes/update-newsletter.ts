import type { NewsletterStateType } from '../state'
import { getSupabaseClient } from '@/agents/shared/database'

export async function updateNewsletter(state: NewsletterStateType): Promise<Partial<NewsletterStateType>> {
  try {
    if (!state.newsletterId) {
      return {
        error: 'Newsletter not created',
      }
    }

    const supabase = getSupabaseClient()

    // Update newsletter with final status
    const updateData: any = {
      html_content: state.emailHtml,
      status: state.status,
    }

    if (state.status === 'sent') {
      updateData.email_provider_id = state.emailProviderId
      updateData.sent_at = new Date().toISOString()
    } else if (state.status === 'failed') {
      updateData.error_message = state.error
    }

    const { error } = await supabase.from('newsletter_sends').update(updateData).eq('id', state.newsletterId)

    if (error) {
      return {
        error: `Failed to update newsletter: ${error.message}`,
      }
    }

    return {}
  } catch (error) {
    console.error('Update newsletter error:', error)
    return {
      error: `Update newsletter failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}
