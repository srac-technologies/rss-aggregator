import OpenAI from 'openai'
import { z } from 'zod'

export class OpenAIClient {
  private client: OpenAI

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set')
    }
    this.client = new OpenAI({ apiKey })
  }

  async generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    model = 'gpt-4-turbo-preview',
    systemPrompt?: string
  ): Promise<{ data: T; tokensUsed: number }> {
    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: [
          ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
          { role: 'user' as const, content: prompt },
        ],
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No content in response')
      }

      const jsonData = JSON.parse(content)
      const validatedData = schema.parse(jsonData)

      return {
        data: validatedData,
        tokensUsed: response.usage?.total_tokens || 0,
      }
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw error
    }
  }

  async generateText(
    prompt: string,
    model = 'gpt-4-turbo-preview',
    systemPrompt?: string,
    maxTokens = 4096
  ): Promise<{ text: string; tokensUsed: number }> {
    try {
      const response = await this.client.chat.completions.create({
        model,
        max_tokens: maxTokens,
        messages: [
          ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
          { role: 'user' as const, content: prompt },
        ],
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No content in response')
      }

      return {
        text: content,
        tokensUsed: response.usage?.total_tokens || 0,
      }
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw error
    }
  }
}

// Singleton instance
let openaiClient: OpenAIClient | null = null

export function getOpenAIClient(): OpenAIClient {
  if (!openaiClient) {
    openaiClient = new OpenAIClient()
  }
  return openaiClient
}
