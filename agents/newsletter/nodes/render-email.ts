import type { NewsletterStateType } from '../state'
import { renderNewsletterEmail } from '../tools/email-renderer'

export async function renderEmail(state: NewsletterStateType): Promise<Partial<NewsletterStateType>> {
  try {
    if (!state.newsletterId) {
      return {
        error: 'Newsletter not created',
        status: 'failed',
      }
    }

    // Get accepted news items for email
    const acceptedNews = state.availableNews.filter((item) => state.acceptedNewsIds.includes(item.id))

    // Generate tracking pixel URL
    const trackingPixelUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3000'}/api/newsletters/track/${state.newsletterId}`

    // Render email
    const htmlContent = await renderNewsletterEmail(
      state.summaryHtml,
      acceptedNews.map((item) => ({
        title: item.title,
        url: item.url,
        content: item.content,
      })),
      trackingPixelUrl
    )

    return {
      emailHtml: htmlContent,
    }
  } catch (error) {
    console.error('Render email error:', error)
    return {
      error: `Render email failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      status: 'failed',
    }
  }
}
