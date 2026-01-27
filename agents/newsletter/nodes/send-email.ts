import type { NewsletterStateType } from '../state'
import { getResendClient } from '../tools/resend-client'

export async function sendEmail(state: NewsletterStateType): Promise<Partial<NewsletterStateType>> {
  try {
    if (!state.settings || !state.newsletterId) {
      return {
        error: 'Settings or newsletter not ready',
        status: 'failed',
      }
    }

    const resendClient = getResendClient()

    const emailResult = await resendClient.sendNewsletter({
      to: state.settings.recipient_email,
      subject: state.settings.subject_template.replace('{{date}}', new Date().toLocaleDateString()),
      html: state.emailHtml,
      trackingId: state.newsletterId.toString(),
      from: `${state.settings.sender_name} <onboarding@resend.dev>`,
    })

    if (emailResult.error) {
      return {
        error: emailResult.error,
        status: 'failed',
      }
    }

    return {
      emailProviderId: emailResult.id,
      status: 'sent',
    }
  } catch (error) {
    console.error('Send email error:', error)
    return {
      error: `Send email failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      status: 'failed',
    }
  }
}
