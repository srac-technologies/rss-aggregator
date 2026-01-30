'use server'

import { supabaseAdmin } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { getLangGraphClient } from '@/lib/langgraph-client'

// Types
export interface Magazine {
  id: string
  name: string
  slug: string
  description: string | null
  cover_image_url: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface CurationAgentSetting {
  id: string
  name: string
  magazine_id: string
  subscription_id: string
  is_active: boolean
  llm_provider: string
  llm_model: string
  selection_prompt: string
  curation_prompt: string
  run_frequency: string
  last_run_at: string | null
  created_at: string
}

export interface CuratedArticle {
  id: string
  magazine_id: string
  title: string
  content: string
  summary: string | null
  status: string
  published_at: string | null
  created_at: string
  source_count?: number
}

// Magazine actions
export async function getMagazines() {
  const { data, error } = await supabaseAdmin
    .from('magazines')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Magazine[]
}

export async function getMagazine(id: string) {
  const { data, error } = await supabaseAdmin
    .from('magazines')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Magazine
}

export async function getMagazineBySlug(slug: string) {
  const { data, error } = await supabaseAdmin
    .from('magazines')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data as Magazine
}

export async function createMagazine(params: {
  name: string
  slug: string
  description?: string
}) {
  const { data, error } = await supabaseAdmin
    .from('magazines')
    .insert(params)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/magazines')
  return data as Magazine
}

export async function updateMagazine(id: string, updates: Partial<Magazine>) {
  const { data, error } = await supabaseAdmin
    .from('magazines')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/magazines')
  revalidatePath(`/magazines/${id}`)
  return data as Magazine
}

export async function deleteMagazine(id: string) {
  const { error } = await supabaseAdmin
    .from('magazines')
    .delete()
    .eq('id', id)

  if (error) throw error
  revalidatePath('/magazines')
}

// Curation Agent Settings actions
export async function getCurationAgentSettings(magazineId?: string) {
  let query = supabaseAdmin
    .from('curation_agent_settings')
    .select(`
      *,
      magazines (name),
      subscriptions (name)
    `)
    .order('created_at', { ascending: false })

  if (magazineId) {
    query = query.eq('magazine_id', magazineId)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getCurationAgentSetting(id: string) {
  const { data, error } = await supabaseAdmin
    .from('curation_agent_settings')
    .select(`
      *,
      magazines (name),
      subscriptions (name)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createCurationAgentSetting(params: {
  name: string
  magazine_id: string
  subscription_id: string
  selection_prompt: string
  curation_prompt: string
  llm_provider?: string
  llm_model?: string
  run_frequency?: string
}) {
  const { data, error } = await supabaseAdmin
    .from('curation_agent_settings')
    .insert({
      ...params,
      llm_provider: params.llm_provider || 'google',
      llm_model: params.llm_model || 'gemini-3-pro-preview',
      run_frequency: params.run_frequency || 'daily',
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/magazines')
  return data
}

export async function updateCurationAgentSetting(id: string, updates: Partial<CurationAgentSetting>) {
  const { data, error } = await supabaseAdmin
    .from('curation_agent_settings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/magazines')
  return data
}

export async function deleteCurationAgentSetting(id: string) {
  const { error } = await supabaseAdmin
    .from('curation_agent_settings')
    .delete()
    .eq('id', id)

  if (error) throw error
  revalidatePath('/magazines')
}

export async function triggerCurationAgent(agentSettingId: string) {
  try {
    const client = getLangGraphClient()
    const result = await client.invoke('curation', { agentSettingId })
    
    revalidatePath('/magazines')
    
    if (result.error) {
      throw new Error(result.error)
    }
    
    return result.result as {
      curatedArticleId: string | null
      articlesEvaluated: number
      articlesAccepted: number
      articlesRejected: number
      tokensUsed: number
      errors: string[]
    }
  } catch (error) {
    console.error('Failed to run curation agent:', error)
    throw error
  }
}

// Curated Articles actions
export async function getCuratedArticles(magazineId: string, limit = 50, offset = 0) {
  const { data, error } = await supabaseAdmin
    .rpc('get_magazine_articles', {
      p_magazine_id: magazineId,
      p_limit: limit,
      p_offset: offset,
      p_status: null, // Get all statuses
    })

  if (error) throw error
  return data as CuratedArticle[]
}

export async function getCuratedArticle(id: string) {
  const { data, error } = await supabaseAdmin
    .rpc('get_curated_article_with_sources', {
      p_curated_article_id: id,
    })

  if (error) throw error
  return data?.[0] || null
}

export async function updateCuratedArticle(id: string, updates: {
  title?: string
  content?: string
  summary?: string
  status?: string
}) {
  const updateData: any = { ...updates, updated_at: new Date().toISOString() }
  
  if (updates.status === 'published') {
    updateData.published_at = new Date().toISOString()
  }

  const { data, error } = await supabaseAdmin
    .from('curated_articles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/magazines')
  return data
}

export async function deleteCuratedArticle(id: string) {
  const { error } = await supabaseAdmin
    .from('curated_articles')
    .delete()
    .eq('id', id)

  if (error) throw error
  revalidatePath('/magazines')
}

// Get source articles for a curated article
export async function getCuratedArticleSources(curatedArticleId: string) {
  const { data, error } = await supabaseAdmin
    .from('curated_article_sources')
    .select(`
      *,
      news (
        id,
        title,
        content,
        url,
        created_at
      )
    `)
    .eq('curated_article_id', curatedArticleId)

  if (error) throw error
  return data
}
