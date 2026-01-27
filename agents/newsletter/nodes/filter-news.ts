import type { NewsletterStateType } from '../state'
import { z } from 'zod'
import { getAnthropicClient } from '@/agents/shared/llm/anthropic'
import { getOpenAIClient } from '@/agents/shared/llm/openai'

const FilterResultSchema = z.object({
  accepted_news_ids: z.array(z.number()).describe('Array of news IDs to include in newsletter'),
  rejected_news_ids: z.array(z.number()).describe('Array of news IDs to exclude'),
  reasoning: z.string().optional().describe('Brief explanation of filtering decisions'),
})

export async function filterNews(state: NewsletterStateType): Promise<Partial<NewsletterStateType>> {
  try {
    if (!state.settings) {
      return {
        error: 'Settings not loaded',
        status: 'failed',
      }
    }

    // Build news list for prompt
    const newsListForPrompt = state.availableNews
      .map(
        (item) =>
          `ID: ${item.id}
Title: ${item.title}
Content: ${item.content.substring(0, 300)}${item.content.length > 300 ? '...' : ''}
Published: ${item.published_at}
---`
      )
      .join('\n\n')

    const filterSystemPrompt = `You are a news filtering assistant. Your task is to select the most relevant and interesting news articles based on the user's criteria.

Rules:
- Analyze each article carefully
- Select articles that match the user's filter criteria
- Return your response as JSON with this structure: {"accepted_news_ids": [1, 2, 3], "rejected_news_ids": [4, 5], "reasoning": "explanation"}`

    const filterUserPrompt = `Filter Criteria:
${state.settings.filter_prompt}

Available News Articles:
${newsListForPrompt}

Select the news IDs that match the filter criteria.`

    let filterResult: { data: z.infer<typeof FilterResultSchema>; tokensUsed: number }

    if (state.settings.llm_provider === 'anthropic') {
      const client = getAnthropicClient()
      filterResult = await client.generateStructured(
        filterUserPrompt,
        FilterResultSchema,
        state.settings.llm_model,
        filterSystemPrompt
      )
    } else {
      const client = getOpenAIClient()
      filterResult = await client.generateStructured(
        filterUserPrompt,
        FilterResultSchema,
        state.settings.llm_model,
        filterSystemPrompt
      )
    }

    return {
      acceptedNewsIds: filterResult.data.accepted_news_ids,
      rejectedNewsIds: filterResult.data.rejected_news_ids,
      filterTokensUsed: filterResult.tokensUsed,
      totalTokensUsed: filterResult.tokensUsed,
    }
  } catch (error) {
    console.error('Filter news error:', error)
    return {
      error: `Filter news failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      status: 'failed',
    }
  }
}
