'use server'

import { supabaseAdmin } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export interface NewsletterSettings {
  id: number
  created_at: string
  subscription_id: string
  recipient_email: string
  sender_name: string
  frequency: 'hourly' | 'daily' | 'weekly'
  send_time: string
  send_day_of_week: number | null
  is_active: boolean
  filter_prompt: string
  summary_prompt: string
  llm_provider: 'anthropic' | 'openai'
  llm_model: string
  subject_template: string
  updated_at: string
}

export interface NewsletterSend {
  id: number
  created_at: string
  subscription_id: string
  newsletter_settings_id: number
  sent_at: string
  recipient_email: string
  subject: string
  status: 'pending' | 'sent' | 'failed' | 'viewed'
  html_content: string
  summary_content: string | null
  email_provider_id: string | null
  error_message: string | null
  news_ids: number[]
  news_count: number
  viewed_at: string | null
  view_count: number
  llm_tokens_used: number | null
  processing_duration_ms: number | null
}

export async function createNewsletterSettings(params: {
  subscriptionId: string
  recipientEmail: string
  filterPrompt: string
  summaryPrompt: string
  frequency: 'hourly' | 'daily' | 'weekly'
  sendTime?: string
  sendDayOfWeek?: number
  senderName?: string
  llmProvider?: 'anthropic' | 'openai'
  llmModel?: string
  subjectTemplate?: string
}) {
  const { data, error } = await supabaseAdmin
    .from('newsletter_settings')
    .insert({
      subscription_id: params.subscriptionId,
      recipient_email: params.recipientEmail,
      filter_prompt: params.filterPrompt,
      summary_prompt: params.summaryPrompt,
      frequency: params.frequency,
      send_time: params.sendTime || '09:00:00',
      send_day_of_week: params.sendDayOfWeek,
      sender_name: params.senderName || 'RSS Aggregator',
      llm_provider: params.llmProvider || 'anthropic',
      llm_model: params.llmModel || 'claude-3-5-sonnet-20241022',
      subject_template: params.subjectTemplate || 'Your Newsletter - {{date}}',
      is_active: true,
    })
    .select()
    .single()

  if (error) throw error

  // Update subscription to mark it has a newsletter
  await supabaseAdmin
    .from('subscriptions')
    .update({ has_newsletter: true })
    .eq('id', params.subscriptionId)

  revalidatePath(`/subscriptions/${params.subscriptionId}`)
  revalidatePath(`/subscriptions/${params.subscriptionId}/newsletter`)
  return data
}

export async function updateNewsletterSettings(
  id: number,
  updates: Partial<Omit<NewsletterSettings, 'id' | 'created_at' | 'subscription_id' | 'updated_at'>>
) {
  const { data, error } = await supabaseAdmin
    .from('newsletter_settings')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  if (data) {
    revalidatePath(`/subscriptions/${data.subscription_id}/newsletter`)
  }

  return data
}

export async function deleteNewsletterSettings(id: number) {
  // First get the subscription_id for revalidation
  const { data: settings } = await supabaseAdmin
    .from('newsletter_settings')
    .select('subscription_id')
    .eq('id', id)
    .single()

  const { error } = await supabaseAdmin.from('newsletter_settings').delete().eq('id', id)

  if (error) throw error

  if (settings) {
    // Update subscription to mark it doesn't have a newsletter
    await supabaseAdmin
      .from('subscriptions')
      .update({ has_newsletter: false })
      .eq('id', settings.subscription_id)

    revalidatePath(`/subscriptions/${settings.subscription_id}`)
    revalidatePath(`/subscriptions/${settings.subscription_id}/newsletter`)
  }
}

export async function getNewsletterSettings(subscriptionId: string) {
  const { data, error } = await supabaseAdmin
    .from('newsletter_settings')
    .select('*')
    .eq('subscription_id', subscriptionId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    throw error
  }

  return data as NewsletterSettings
}

export async function getNewsletterHistory(subscriptionId: string, limit = 50) {
  const { data, error } = await supabaseAdmin
    .from('newsletter_sends')
    .select('*')
    .eq('subscription_id', subscriptionId)
    .order('sent_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as NewsletterSend[]
}

export async function getNewsletterDetails(newsletterId: number) {
  const { data, error } = await supabaseAdmin
    .from('newsletter_sends')
    .select(
      `
      *,
      newsletter_settings (
        recipient_email,
        sender_name,
        llm_provider,
        llm_model
      )
    `
    )
    .eq('id', newsletterId)
    .single()

  if (error) throw error
  return data
}

export async function toggleNewsletterActive(id: number, isActive: boolean) {
  const { data, error } = await supabaseAdmin
    .from('newsletter_settings')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  if (data) {
    revalidatePath(`/subscriptions/${data.subscription_id}/newsletter`)
  }

  return data
}
