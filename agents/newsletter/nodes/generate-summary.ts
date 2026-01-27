import type { NewsletterStateType } from '../state'
import { getAnthropicClient } from '@/agents/shared/llm/anthropic'
import { getOpenAIClient } from '@/agents/shared/llm/openai'

export async function generateSummary(state: NewsletterStateType): Promise<Partial<NewsletterStateType>> {
  try {
    if (!state.settings) {
      return {
        error: 'Settings not loaded',
        status: 'failed',
      }
    }

    // Get accepted news items
    const acceptedNews = state.availableNews.filter((item) => state.acceptedNewsIds.includes(item.id))

    // Build news content for summary
    const newsContentForSummary = acceptedNews
      .map(
        (item) =>
          `Title: ${item.title}
URL: ${item.url}
Content: ${item.content}
Published: ${item.published_at}
---`
      )
      .join('\n\n')

    const summarySystemPrompt = `You are a newsletter writer. Your task is to create engaging, informative newsletter content based on the provided news articles.

Rules:
- Write in a clear, professional tone
- Highlight the most important points
- Include context and insights
- Format in HTML for email display`

    const summaryUserPrompt = `Summary Instructions:
${state.settings.summary_prompt}

News Articles to Summarize:
${newsContentForSummary}

Generate the newsletter content.`

    let summaryResult: { text: string; tokensUsed: number }

    if (state.settings.llm_provider === 'anthropic') {
      const client = getAnthropicClient()
      summaryResult = await client.generateText(
        summaryUserPrompt,
        state.settings.llm_model,
        summarySystemPrompt,
        8192
      )
    } else {
      const client = getOpenAIClient()
      summaryResult = await client.generateText(
        summaryUserPrompt,
        state.settings.llm_model,
        summarySystemPrompt,
        8192
      )
    }

    return {
      summaryHtml: summaryResult.text,
      summaryTokensUsed: summaryResult.tokensUsed,
      totalTokensUsed: summaryResult.tokensUsed,
    }
  } catch (error) {
    console.error('Generate summary error:', error)
    return {
      error: `Generate summary failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      status: 'failed',
    }
  }
}
