import type { NewsCollectorStateType } from '../state'

// After check_duplicate - decide what to do next
export function afterCheckDuplicate(state: NewsCollectorStateType): string {
  // If collection is complete, move to metrics
  if (state.collectionComplete) {
    return 'update_metrics'
  }

  // If shouldContinue is true, insert the news
  // Otherwise, loop back to check next item
  if (state.shouldContinue) {
    return 'insert_news'
  }

  return 'check_duplicate'
}

// After insert_news - decide whether to auto-tag
export function shouldAutoTag(state: NewsCollectorStateType): string {
  if (!state.source?.auto_tag_enabled) {
    // Skip auto-tagging, move to next item
    return 'check_duplicate'
  }

  return 'auto_tag'
}

// After auto_tag - decide whether to apply tags
export function shouldApplyTags(state: NewsCollectorStateType): string {
  const lastProcessed = state.processedItems[state.processedItems.length - 1]

  if (!lastProcessed || lastProcessed.tagIds.length === 0) {
    // No tags to apply, move to next item
    return 'check_duplicate'
  }

  return 'apply_tags'
}
