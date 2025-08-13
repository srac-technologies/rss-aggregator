'use server'

import { supabaseAdmin } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export interface Subscription {
  id: string
  created_at: string
  tags?: Tag[]
}

export interface Tag {
  id: number
  tag: string
  created_at: string
}

export interface SubscriptionTag {
  id: number
  subscription_id: string
  tag_id: number
  created_at: string
}

export async function getSubscriptions() {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select(`
      *,
      subscriptions_tags (
        tag_id,
        tags (
          id,
          tag
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getSubscription(id: string) {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select(`
      *,
      subscriptions_tags (
        tag_id,
        tags (
          id,
          tag
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createSubscription() {
  'use server'
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .insert({})
    .select()
    .single()

  if (error) throw error
  revalidatePath('/subscriptions')
  return data
}

export async function deleteSubscription(id: string) {
  'use server'
  // First delete associated subscription_tags
  await supabaseAdmin
    .from('subscriptions_tags')
    .delete()
    .eq('subscription_id', id)

  // Then delete the subscription
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .delete()
    .eq('id', id)

  if (error) throw error
  revalidatePath('/subscriptions')
}

export async function addTagToSubscription(subscriptionId: string, tagId: number) {
  'use server'
  const { data, error } = await supabaseAdmin
    .from('subscriptions_tags')
    .insert({
      subscription_id: subscriptionId,
      tag_id: tagId
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath(`/subscriptions/${subscriptionId}`)
  return data
}

export async function removeTagFromSubscription(subscriptionId: string, tagId: number) {
  'use server'
  const { error } = await supabaseAdmin
    .from('subscriptions_tags')
    .delete()
    .eq('subscription_id', subscriptionId)
    .eq('tag_id', tagId)

  if (error) throw error
  revalidatePath(`/subscriptions/${subscriptionId}`)
}
