import type { NewsCollectorStateType } from '../state'

export function routeCollector(state: NewsCollectorStateType): string {
  if (!state.source) {
    return 'update_metrics'
  }

  if (state.source.type === 'rss') {
    return 'collect_items_rss'
  }

  if (state.source.type === 'tavily_search') {
    return 'collect_items_tavily'
  }

  return 'update_metrics'
}
