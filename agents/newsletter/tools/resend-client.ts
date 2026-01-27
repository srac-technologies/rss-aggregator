import { Resend } from 'resend'

export class ResendClient {
  private resend: Resend

  constructor() {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }
    this.resend = new Resend(apiKey)
  }

  async sendNewsletter(params: {
    to: string
    subject: string
    html: string
    trackingId: string
    from?: string
  }): Promise<{ id: string; error?: string }> {
    try {
      const response = await this.resend.emails.send({
        from: params.from || 'RSS Aggregator <onboarding@resend.dev>',
        to: params.to,
        subject: params.subject,
        html: params.html,
        tags: [
          {
            name: 'newsletter_id',
            value: params.trackingId,
          },
        ],
      })

      if (response.error) {
        return {
          id: '',
          error: response.error.message,
        }
      }

      return {
        id: response.data?.id || '',
      }
    } catch (error) {
      console.error('Resend API error:', error)
      return {
        id: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

// Singleton instance
let resendClient: ResendClient | null = null

export function getResendClient(): ResendClient {
  if (!resendClient) {
    resendClient = new ResendClient()
  }
  return resendClient
}
