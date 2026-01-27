import { z } from 'zod'
import { getAnthropicClient } from '@/agents/shared/llm/anthropic'
import { getOpenAIClient } from '@/agents/shared/llm/openai'
import { getSupabaseClient } from '@/agents/shared/database'
import type { LLMProvider } from '@/agents/shared/types'

const TagSelectionSchema = z.object({
  tag_ids: z.array(z.number()).describe('Array of selected tag IDs'),
  reasoning: z.string().optional().describe('Brief explanation of tag selections'),
})

export interface AutoTagResult {
  tagIds: number[]
  tokensUsed: number
  reasoning?: string
}

export async function autoTagNews(
  newsId: number,
  title: string,
  content: string,
  provider: LLMProvider = 'anthropic',
  model?: string
): Promise<AutoTagResult> {
  try {
    const supabase = getSupabaseClient()

    // Fetch all existing tags
    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('id, tag')
      .order('tag')

    if (tagsError) {
      throw new Error(`Failed to fetch tags: ${tagsError.message}`)
    }

    if (!tags || tags.length === 0) {
      return { tagIds: [], tokensUsed: 0 }
    }

    // Build tag list for prompt
    const tagList = tags.map((tag) => `- ID ${tag.id}: "${tag.tag}"`).join('\n')

    const systemPrompt = `You are a news categorization expert. Your task is to analyze news articles and select the most relevant tags from a predefined list.

Rules:
- Select 1-5 tags that are most relevant to the article
- Focus on the main topics and themes
- Be selective - only choose tags that truly fit
- Return your response as JSON with this structure: {"tag_ids": [1, 2, 3], "reasoning": "brief explanation"}`

    const userPrompt = `Available tags:
${tagList}

Article to categorize:
Title: ${title}
Content: ${content.substring(0, 1000)}${content.length > 1000 ? '...' : ''}

Select the most relevant tag IDs for this article.`

    let result: { data: z.infer<typeof TagSelectionSchema>; tokensUsed: number }

    if (provider === 'anthropic') {
      const client = getAnthropicClient()
      result = await client.generateStructured(
        userPrompt,
        TagSelectionSchema,
        model || 'claude-3-5-haiku-20241022',
        systemPrompt
      )
    } else {
      const client = getOpenAIClient()
      result = await client.generateStructured(
        userPrompt,
        TagSelectionSchema,
        model || 'gpt-4-turbo-preview',
        systemPrompt
      )
    }

    // Validate that all tag IDs exist
    const validTagIds = tags.map((t) => t.id)
    const selectedTagIds = result.data.tag_ids.filter((id) => validTagIds.includes(id))

    return {
      tagIds: selectedTagIds,
      tokensUsed: result.tokensUsed,
      reasoning: result.data.reasoning,
    }
  } catch (error) {
    console.error('Auto-tagging error:', error)
    throw error
  }
}
