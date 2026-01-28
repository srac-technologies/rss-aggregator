'use server'

import { supabaseAdmin } from '@/lib/supabase-server'

export interface NewsItem {
  id: bigint
  created_at: string
  guid: string
  url: string | null
  content: string | null
  title: string | null
  parent: string | null
  tagged_at: string | null
  subscription_id?: string
}

export async function getNewsBySubscription(subscriptionId: string, limit: number = 10): Promise<NewsItem[]> {
  const { data, error } = await supabaseAdmin
    .rpc('get_rss_feed', {
      p_subscription_id: subscriptionId,
      p_limit: limit
    })

  if (error) {
    console.error('Error fetching news by subscription:', error)
    return []
  }

  return data || []
}

export async function getNewsById(newsId: number): Promise<NewsItem | null> {
  const { data, error } = await supabaseAdmin
    .from('news')
    .select('*')
    .eq('id', newsId)
    .single()

  if (error) {
    console.error('Error fetching news by id:', error)
    return null
  }

  return data
}

export async function getAllNews(limit: number = 1000, offset: number = 0): Promise<NewsItem[]> {
  const { data, error } = await supabaseAdmin
    .from('news')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching all news:', error)
    return []
  }

  return data || []
}

export async function searchNews(query: string, limit: number = 50): Promise<NewsItem[]> {
  if (!query.trim()) {
    return []
  }

  const searchTerm = query.trim()
  
  // Search in title first
  const { data: titleResults, error: titleError } = await supabaseAdmin
    .from('news')
    .select('*')
    .ilike('title', `%${searchTerm}%`)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (titleError) {
    console.error('Error searching news by title:', titleError)
  }

  // Search in content
  const { data: contentResults, error: contentError } = await supabaseAdmin
    .from('news')
    .select('*')
    .ilike('content', `%${searchTerm}%`)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (contentError) {
    console.error('Error searching news by content:', contentError)
  }

  // Merge and dedupe results
  const allResults = [...(titleResults || []), ...(contentResults || [])]
  const seen = new Set<number>()
  const uniqueResults = allResults.filter(item => {
    const id = Number(item.id)
    if (seen.has(id)) return false
    seen.add(id)
    return true
  })

  // Sort by created_at descending and limit
  return uniqueResults
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit)
}
