import type { NewsCollectorStateType } from '../state'
import { getSupabaseClient } from '@/agents/shared/database'

export async function applyTags(state: NewsCollectorStateType): Promise<Partial<NewsCollectorStateType>> {
  try {
    const lastProcessed = state.processedItems[state.processedItems.length - 1]

    if (!lastProcessed || lastProcessed.tagIds.length === 0) {
      return {
        currentItemIndex: state.currentItemIndex + 1,
      }
    }

    const supabase = getSupabaseClient()

    // Insert tags into news_tags table
    const newsTagsData = lastProcessed.tagIds.map((tagId) => ({
      news_id: lastProcessed.newsId,
      tag_id: tagId,
    }))

    const { error: tagsError } = await supabase.from('news_tags').insert(newsTagsData)

    if (tagsError) {
      return {
        errors: [`Failed to insert tags: ${tagsError.message}`],
        currentItemIndex: state.currentItemIndex + 1,
      }
    }

    // Update news record to mark as auto-tagged
    const { error: updateError } = await supabase
      .from('news')
      .update({ auto_tagged: true })
      .eq('id', lastProcessed.newsId)

    if (updateError) {
      return {
        errors: [`Failed to mark news as auto-tagged: ${updateError.message}`],
        currentItemIndex: state.currentItemIndex + 1,
      }
    }

    // Move to next item
    return {
      currentItemIndex: state.currentItemIndex + 1,
    }
  } catch (error) {
    console.error('Apply tags error:', error)
    return {
      errors: [`Apply tags failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      currentItemIndex: state.currentItemIndex + 1,
    }
  }
}
