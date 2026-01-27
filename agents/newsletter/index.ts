import { newsletterGraph } from './graph'
import type { NewsletterStateType } from './state'

export interface NewsletterResult {
  newsletterId: number | null
  status: 'pending' | 'processing' | 'sent' | 'failed'
  newsCount: number
  tokensUsed: number
  error: string | null
}

export async function runNewsletter(subscriptionId: string): Promise<NewsletterResult> {
  const initialState: Partial<NewsletterStateType> = {
    subscriptionId,
  }

  const result = await newsletterGraph.invoke(initialState)

  return {
    newsletterId: result.newsletterId,
    status: result.status,
    newsCount: result.acceptedNewsIds.length,
    tokensUsed: result.totalTokensUsed,
    error: result.error,
  }
}

export { newsletterGraph }
export type { NewsletterStateType }
