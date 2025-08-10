import { NextRequest, NextResponse } from 'next/server'
import RSS from 'rss'
import { supabase } from '@/lib/supabase'

const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

interface NewsItem {
  id: bigint
  created_at: string
  guid: string
  url: string | null
  content: string | null
  title: string | null
  parent: string | null
  tagged_at: string | null
  subscription_id: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subscriptionId: string }> }
) {
  const { subscriptionId } = await params
  
  const cacheKey = `rss_${subscriptionId}`
  const cachedData = cache.get(cacheKey)
  
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return new NextResponse(cachedData.data, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'X-Cache': 'HIT'
      }
    })
  }
  
  try {
    // Query the rss_feed view directly with subscription_id
    const { data: feedData, error } = await supabase
      .from('rss_feed')
      .select('*')
      .eq('subscription_id', subscriptionId)
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (error) {
      console.error('Supabase query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch RSS feed data' },
        { status: 500 }
      )
    }
    
    if (!feedData || feedData.length === 0) {
      return NextResponse.json(
        { error: 'No feed data found for this subscription' },
        { status: 404 }
      )
    }
    
    // Create RSS feed with metadata
    const feed = new RSS({
      title: `RSS Feed - Subscription ${subscriptionId}`,
      description: 'Personalized RSS feed based on your tag subscriptions',
      feed_url: `${request.nextUrl.origin}/api/rss/${subscriptionId}`,
      site_url: request.nextUrl.origin,
      docs: 'https://www.rssboard.org/rss-specification',
      copyright: `Copyright ${new Date().getFullYear()}`,
      language: 'en',
      pubDate: new Date().toUTCString(),
      ttl: 60 // TTL in minutes (1 hour)
    })
    
    // Add each news item to the RSS feed
    feedData.forEach((item: NewsItem) => {
      if (item.title || item.content) { // Only add items with content
        feed.item({
          title: item.title || 'Untitled',
          description: item.content || item.title || '',
          url: item.url || item.parent || '#',
          guid: item.guid,
          date: new Date(item.tagged_at || item.created_at),
          custom_elements: item.parent ? [
            { 'source:parent': item.parent }
          ] : []
        })
      }
    })
    
    const xml = feed.xml({ indent: true })
    
    cache.set(cacheKey, {
      data: xml,
      timestamp: Date.now()
    })
    
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'X-Cache': 'MISS'
      }
    })
    
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}