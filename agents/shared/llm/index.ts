import { z } from 'zod'
import { getAnthropicClient } from './anthropic'
import { getGeminiClient } from './gemini'
import { getOpenAIClient } from './openai'

export interface LLMClient {
  generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    model?: string,
    systemPrompt?: string
  ): Promise<{ data: T; tokensUsed: number }>
  
  generateText(
    prompt: string,
    model?: string,
    systemPrompt?: string
  ): Promise<{ text: string; tokensUsed: number }>
}

export function getLLMClient(provider: string): LLMClient {
  switch (provider.toLowerCase()) {
    case 'anthropic':
      return getAnthropicClient()
    case 'google':
    case 'gemini':
      return getGeminiClient()
    case 'openai':
      return getOpenAIClient()
    default:
      throw new Error(`Unsupported LLM provider: ${provider}`)
  }
}

// Default provider and model
export const DEFAULT_LLM_PROVIDER = 'google'
export const DEFAULT_LLM_MODEL = 'gemini-3-pro-preview'
