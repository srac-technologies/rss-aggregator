import type { NewsCollectorStateType } from '../state'
import { getSupabaseClient } from '@/agents/shared/database'

export async function checkDuplicate(state: NewsCollectorStateType): Promise<Partial<NewsCollectorStateType>> {
  try {
    // Check if we've processed all items
    if (state.currentItemIndex >= state.items.length) {
      return {
        collectionComplete: true,
        shouldContinue: false,
      }
    }

    const currentItem = state.items[state.currentItemIndex]
    const supabase = getSupabaseClient()

    // Check if item already exists
    const { data: existingNews, error } = await supabase
      .from('news')
      .select('id')
      .eq('guid', currentItem.guid)
      .maybeSingle()

    if (error) {
      return {
        errors: [`Failed to check duplicate for ${currentItem.guid}: ${error.message}`],
        currentItemIndex: state.currentItemIndex + 1,
        itemsSkipped: 1,
        shouldContinue: false, // Skip to next (will go back to check_duplicate)
      }
    }

    if (existingNews) {
      // Item exists, skip it and move to next
      return {
        currentItemIndex: state.currentItemIndex + 1,
        itemsSkipped: 1,
        shouldContinue: false, // Skip to next (will go back to check_duplicate)
      }
    }

    // Item doesn't exist, will proceed to insert
    return {
      shouldContinue: true, // Proceed to insert
    }
  } catch (error) {
    console.error('Check duplicate error:', error)
    return {
      errors: [`Duplicate check failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      currentItemIndex: state.currentItemIndex + 1,
      itemsSkipped: 1,
      shouldContinue: false,
    }
  }
}
