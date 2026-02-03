'use server'

import { supabaseAdmin } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { getLangGraphClient } from '@/lib/langgraph-client'

export interface NewsSource {
  id: number
  created_at: string
  name: string
  type: 'rss' | 'tavily_search'
  is_active: boolean
  rss_url: string | null
  tavily_query: string | null
  tavily_search_depth: 'basic' | 'advanced'
  tavily_days: number
  collection_frequency: 'hourly' | 'daily' | 'weekly'
  last_collected_at: string | null
  next_collection_at: string | null
  auto_tag_enabled: boolean
  llm_provider: 'anthropic' | 'openai'
  llm_model: string
  total_items_collected: number
  last_error: string | null
  updated_at: string
}

export interface CollectionRun {
  id: number
  created_at: string
  source_id: number
  started_at: string
  completed_at: string | null
  status: 'running' | 'completed' | 'failed'
  items_fetched: number
  items_new: number
  items_skipped: number
  duration_ms: number | null
  llm_tokens_used: number | null
  error_message: string | null
  error_stack: string | null
}

export async function createNewsSource(params: {
  name: string
  type: 'rss' | 'tavily_search'
  rssUrl?: string
  tavilyQuery?: string
  tavilySearchDepth?: 'basic' | 'advanced'
  tavilyDays?: number
  collectionFrequency?: 'hourly' | 'daily' | 'weekly'
  autoTagEnabled?: boolean
  llmProvider?: 'anthropic' | 'openai'
  llmModel?: string
}) {
  // Calculate next collection time
  const now = new Date()
  const nextCollectionAt = calculateNextCollectionTime(params.collectionFrequency || 'hourly', now)

  const { data, error } = await supabaseAdmin
    .from('news_collection_sources')
    .insert({
      name: params.name,
      type: params.type,
      rss_url: params.rssUrl,
      tavily_query: params.tavilyQuery,
      tavily_search_depth: params.tavilySearchDepth || 'basic',
      tavily_days: params.tavilyDays || 1,
      collection_frequency: params.collectionFrequency || 'hourly',
      next_collection_at: nextCollectionAt,
      auto_tag_enabled: params.autoTagEnabled !== undefined ? params.autoTagEnabled : true,
      llm_provider: params.llmProvider || 'anthropic',
      llm_model: params.llmModel || 'claude-3-5-haiku-20241022',
      is_active: true,
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/admin/sources')
  return data
}

export async function updateNewsSource(
  id: number,
  updates: Partial<Omit<NewsSource, 'id' | 'created_at' | 'updated_at'>>
) {
  const { data, error } = await supabaseAdmin
    .from('news_collection_sources')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/admin/sources')
  revalidatePath(`/admin/sources/${id}`)
  return data
}

export async function deleteNewsSource(id: number) {
  const { error } = await supabaseAdmin.from('news_collection_sources').delete().eq('id', id)

  if (error) throw error
  revalidatePath('/admin/sources')
}

export async function getNewsSources() {
  const { data, error } = await supabaseAdmin
    .from('news_collection_sources')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as NewsSource[]
}

export async function getNewsSource(id: number) {
  const { data, error } = await supabaseAdmin
    .from('news_collection_sources')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as NewsSource
}

export async function getCollectionRuns(sourceId: number, limit = 50) {
  const { data, error } = await supabaseAdmin
    .from('news_collection_runs')
    .select('*')
    .eq('source_id', sourceId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as CollectionRun[]
}

export async function getCollectionRun(id: number) {
  const { data, error } = await supabaseAdmin
    .from('news_collection_runs')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as CollectionRun
}

export async function triggerCollection(sourceId: number) {
  try {
    const client = getLangGraphClient()
    const result = await client.invoke('news-collector', { sourceId })
    
    revalidatePath(`/admin/sources/${sourceId}`)
    
    if (result.error) {
      throw new Error(result.error)
    }
    
    return {
      success: true,
      ...(result.result as {
        itemsFetched: number
        itemsNew: number
        itemsSkipped: number
        tokensUsed: number
        errors: string[]
      }),
    }
  } catch (error) {
    console.error('Failed to trigger collection:', error)
    throw error
  }
}

export async function toggleSourceActive(id: number, isActive: boolean) {
  const { data, error } = await supabaseAdmin
    .from('news_collection_sources')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/admin/sources')
  revalidatePath(`/admin/sources/${id}`)
  return data
}

function calculateNextCollectionTime(frequency: string, fromTime: Date): string {
  switch (frequency) {
    case 'hourly':
      return new Date(fromTime.getTime() + 60 * 60 * 1000).toISOString()
    case 'daily':
      return new Date(fromTime.getTime() + 24 * 60 * 60 * 1000).toISOString()
    case 'weekly':
      return new Date(fromTime.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
    default:
      return new Date(fromTime.getTime() + 60 * 60 * 1000).toISOString()
  }
}
