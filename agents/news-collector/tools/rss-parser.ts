import Parser from 'rss-parser'
import type { NewsItem } from '@/agents/shared/types'

const rssParser = new Parser()

export async function parseRSSFeed(url: string): Promise<NewsItem[]> {
  try {
    const feed = await rssParser.parseURL(url)

    return feed.items.map((item) => ({
      guid: item.guid || item.link || item.title || '',
      title: item.title || 'Untitled',
      url: item.link || '',
      content: item.contentSnippet || item.content || '',
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    }))
  } catch (error) {
    console.error('RSS parsing error:', error)
    throw new Error(`Failed to parse RSS feed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
