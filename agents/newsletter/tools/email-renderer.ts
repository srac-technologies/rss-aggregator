import { render } from '@react-email/components'
import NewsletterEmail from '@/emails/newsletter'

export interface NewsItemForEmail {
  title: string
  url: string
  content: string
}

export async function renderNewsletterEmail(
  summary: string,
  newsItems: NewsItemForEmail[],
  trackingPixelUrl: string
): Promise<string> {
  try {
    const htmlContent = await render(
      NewsletterEmail({
        summary,
        newsItems,
        trackingPixelUrl,
      })
    )

    return htmlContent
  } catch (error) {
    console.error('Email rendering error:', error)
    throw new Error(`Failed to render email: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
