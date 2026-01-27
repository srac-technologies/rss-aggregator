import type { NewsCollectorStateType } from '../state'

export function shouldProcessItems(state: NewsCollectorStateType): string {
  // If no items were collected, skip to metrics
  if (!state.items || state.items.length === 0) {
    return 'update_metrics'
  }

  // If we have items, start processing from first item
  return 'check_duplicate'
}
