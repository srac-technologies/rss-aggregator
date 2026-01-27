import type { NewsletterStateType } from '../state'
import { getSupabaseClient } from '@/agents/shared/database'

export async function fetchNews(state: NewsletterStateType): Promise<Partial<NewsletterStateType>> {
  try {
    const supabase = getSupabaseClient()

    // Fetch news items from rss_feed view
    const { data: newsItems, error } = await supabase
      .from('rss_feed')
      .select('id, title, url, content, created_at')
      .eq('subscription_id', state.subscriptionId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return {
        error: `Failed to fetch news: ${error.message}`,
        status: 'failed',
      }
    }

    if (!newsItems || newsItems.length === 0) {
      return {
        error: 'No news items found for this subscription',
        status: 'failed',
      }
    }

    return {
      availableNews: newsItems
        .filter((item) => item.id !== null)
        .map((item) => ({
          id: item.id!,
          title: item.title || '',
          url: item.url || '',
          content: item.content || '',
          published_at: item.created_at || new Date().toISOString(),
        })),
    }
  } catch (error) {
    console.error('Fetch news error:', error)
    return {
      error: `Fetch news failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      status: 'failed',
    }
  }
}
