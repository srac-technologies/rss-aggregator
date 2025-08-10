'use server'

import { supabaseAdmin } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function getTags() {
  const { data, error } = await supabaseAdmin
    .from('tags')
    .select('*')
    .order('tag', { ascending: true })

  if (error) throw error
  return data
}

export async function createTag(tag: string) {
  const { data, error } = await supabaseAdmin
    .from('tags')
    .insert({ tag })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/tags')
  revalidatePath('/subscriptions')
  return data
}

export async function updateTag(id: number, tag: string) {
  const { data, error } = await supabaseAdmin
    .from('tags')
    .update({ tag })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/tags')
  revalidatePath('/subscriptions')
  return data
}

export async function deleteTag(id: number) {
  // First delete associated subscription_tags and news_tags
  await supabaseAdmin
    .from('subscriptions_tags')
    .delete()
    .eq('tag_id', id)

  await supabaseAdmin
    .from('news_tags')
    .delete()
    .eq('tag_id', id)

  // Then delete the tag
  const { error } = await supabaseAdmin
    .from('tags')
    .delete()
    .eq('id', id)

  if (error) throw error
  revalidatePath('/tags')
  revalidatePath('/subscriptions')
}