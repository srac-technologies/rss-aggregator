import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

export class AnthropicClient {
  private client: Anthropic

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set')
    }
    this.client = new Anthropic({ apiKey })
  }

  async generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    model = 'claude-3-5-sonnet-20241022',
    systemPrompt?: string
  ): Promise<{ data: T; tokensUsed: number }> {
    try {
      const response = await this.client.messages.create({
        model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

      const textContent = response.content.find((c) => c.type === 'text')
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in response')
      }

      // Try to parse JSON from the response
      let jsonData: unknown
      const text = textContent.text.trim()

      // Extract JSON if wrapped in markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || text.match(/(\{[\s\S]*\})/)
      if (jsonMatch) {
        jsonData = JSON.parse(jsonMatch[1])
      } else {
        jsonData = JSON.parse(text)
      }

      const validatedData = schema.parse(jsonData)

      return {
        data: validatedData,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      }
    } catch (error) {
      console.error('Anthropic API error:', error)
      throw error
    }
  }

  async generateText(
    prompt: string,
    model = 'claude-3-5-sonnet-20241022',
    systemPrompt?: string,
    maxTokens = 4096
  ): Promise<{ text: string; tokensUsed: number }> {
    try {
      const response = await this.client.messages.create({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

      const textContent = response.content.find((c) => c.type === 'text')
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in response')
      }

      return {
        text: textContent.text,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      }
    } catch (error) {
      console.error('Anthropic API error:', error)
      throw error
    }
  }
}

// Singleton instance
let anthropicClient: AnthropicClient | null = null

export function getAnthropicClient(): AnthropicClient {
  if (!anthropicClient) {
    anthropicClient = new AnthropicClient()
  }
  return anthropicClient
}
