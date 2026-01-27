import type { NewsCollectorStateType } from '../state'
import { parseRSSFeed } from '../tools/rss-parser'

export async function collectItemsRss(state: NewsCollectorStateType): Promise<Partial<NewsCollectorStateType>> {
  try {
    if (!state.source?.rss_url) {
      return {
        errors: ['RSS URL is required for RSS source'],
        shouldContinue: false,
      }
    }

    const items = await parseRSSFeed(state.source.rss_url)

    return {
      items: items.filter((item) => item.guid), // Filter out items without GUID
      itemsFetched: items.length,
    }
  } catch (error) {
    console.error('RSS collection error:', error)
    return {
      errors: [`RSS collection failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      items: [],
      itemsFetched: 0,
    }
  }
}
