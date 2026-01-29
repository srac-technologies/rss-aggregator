import type { CurationStateType, SourceArticle } from '../state'
import { getSupabaseClient } from '@/agents/shared/database'

export async function fetchSourceArticles(state: CurationStateType): Promise<Partial<CurationStateType>> {
  if (!state.subscriptionId || !state.agentSettings) {
    return {
      errors: ['Missing subscription ID or agent settings'],
      shouldContinue: false,
    }
  }

  const supabase = getSupabaseClient()

  try {
    // Fetch recent articles from the subscription using the get_rss_feed function
    const { data: articles, error } = await supabase
      .rpc('get_rss_feed', {
        p_subscription_id: state.subscriptionId,
        p_limit: 50, // Fetch last 50 articles
        p_offset: 0,
      })

    if (error) {
      return {
        errors: [`Failed to fetch articles: ${error.message}`],
        shouldContinue: false,
      }
    }

    if (!articles || articles.length === 0) {
      return {
        errors: ['No articles found for this subscription'],
        shouldContinue: false,
      }
    }

    const sourceArticles: SourceArticle[] = articles.map((article: any) => ({
      id: article.id,
      title: article.title,
      content: article.content,
      url: article.url,
      created_at: article.created_at,
    }))

    return {
      sourceArticles,
      articlesEvaluated: sourceArticles.length,
    }
  } catch (error) {
    console.error('Fetch articles error:', error)
    return {
      errors: [`Fetch articles failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      shouldContinue: false,
    }
  }
}
