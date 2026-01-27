import type { NewsCollectorStateType } from '../state'
import { autoTagNews } from '../tools/llm-tagger'

export async function autoTag(state: NewsCollectorStateType): Promise<Partial<NewsCollectorStateType>> {
  try {
    const currentItem = state.items[state.currentItemIndex]
    const lastProcessed = state.processedItems[state.processedItems.length - 1]

    if (!lastProcessed) {
      return {
        errors: ['No processed item found for auto-tagging'],
        currentItemIndex: state.currentItemIndex + 1,
      }
    }

    const tagResult = await autoTagNews(
      lastProcessed.newsId,
      currentItem.title,
      currentItem.content,
      state.source!.llm_provider!,
      state.source!.llm_model || undefined
    )

    // Update the last processed item with tag information
    const updatedProcessedItems = [...state.processedItems]
    updatedProcessedItems[updatedProcessedItems.length - 1] = {
      ...lastProcessed,
      tagIds: tagResult.tagIds,
      tokensUsed: tagResult.tokensUsed,
    }

    return {
      processedItems: updatedProcessedItems,
      tokensUsed: tagResult.tokensUsed,
    }
  } catch (error) {
    console.error('Auto-tag error:', error)
    return {
      errors: [`Auto-tag failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      currentItemIndex: state.currentItemIndex + 1,
    }
  }
}
