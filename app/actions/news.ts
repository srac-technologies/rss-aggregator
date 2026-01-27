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
    .from('rss_feed')
    .select('*')
    .eq('subscription_id', subscriptionId)
    .order('created_at', { ascending: false })
    .limit(limit)

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

  // Try full-text search first using PostgreSQL's to_tsquery
  // Supabase supports textSearch for full-text search
  const { data, error } = await supabaseAdmin
    .from('news')
    .select('*')
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error searching news:', error)
    return []
  }

  return data || []
}
