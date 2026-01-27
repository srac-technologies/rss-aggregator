import type { NewsCollectorStateType } from '../state'
import { getSupabaseClient } from '@/agents/shared/database'

export async function insertNews(state: NewsCollectorStateType): Promise<Partial<NewsCollectorStateType>> {
  try {
    const currentItem = state.items[state.currentItemIndex]
    const supabase = getSupabaseClient()

    // Insert new news item
    const { data: newNews, error: insertError } = await supabase
      .from('news')
      .insert({
        title: currentItem.title,
        url: currentItem.url,
        content: currentItem.content,
        published_at: currentItem.publishedAt,
        guid: currentItem.guid,
        source_id: state.source!.id,
        collected_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (insertError || !newNews) {
      return {
        errors: [`Failed to insert news: ${insertError?.message || 'Unknown error'}`],
        currentItemIndex: state.currentItemIndex + 1,
        itemsSkipped: 1,
      }
    }

    // Store the processed item (without tags yet)
    return {
      itemsNew: 1,
      processedItems: [
        {
          newsId: newNews.id,
          tagIds: [],
          tokensUsed: 0,
        },
      ],
    }
  } catch (error) {
    console.error('Insert news error:', error)
    return {
      errors: [`Insert news failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      currentItemIndex: state.currentItemIndex + 1,
      itemsSkipped: 1,
    }
  }
}
