import { GoogleGenerativeAI } from '@google/generative-ai'
import { z } from 'zod'

export class GeminiClient {
  private client: GoogleGenerativeAI

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY environment variable is not set')
    }
    this.client = new GoogleGenerativeAI(apiKey)
  }

  async generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    model = 'gemini-3-pro-preview',
    systemPrompt?: string
  ): Promise<{ data: T; tokensUsed: number }> {
    try {
      const genModel = this.client.getGenerativeModel({ model })
      
      const fullPrompt = systemPrompt 
        ? `${systemPrompt}\n\n${prompt}`
        : prompt

      const result = await genModel.generateContent(fullPrompt)
      const response = result.response
      const text = response.text().trim()

      // Try to parse JSON from the response
      let jsonData: unknown
      const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || text.match(/(\{[\s\S]*\})/)
      if (jsonMatch) {
        jsonData = JSON.parse(jsonMatch[1])
      } else {
        jsonData = JSON.parse(text)
      }

      const validatedData = schema.parse(jsonData)

      // Estimate tokens (Gemini doesn't always return exact counts)
      const tokensUsed = response.usageMetadata?.totalTokenCount || 
        Math.ceil((fullPrompt.length + text.length) / 4)

      return {
        data: validatedData,
        tokensUsed,
      }
    } catch (error) {
      console.error('Gemini API error:', error)
      throw error
    }
  }

  async generateText(
    prompt: string,
    model = 'gemini-3-pro-preview',
    systemPrompt?: string
  ): Promise<{ text: string; tokensUsed: number }> {
    try {
      const genModel = this.client.getGenerativeModel({ model })
      
      const fullPrompt = systemPrompt 
        ? `${systemPrompt}\n\n${prompt}`
        : prompt

      const result = await genModel.generateContent(fullPrompt)
      const response = result.response
      const text = response.text()

      const tokensUsed = response.usageMetadata?.totalTokenCount || 
        Math.ceil((fullPrompt.length + text.length) / 4)

      return {
        text,
        tokensUsed,
      }
    } catch (error) {
      console.error('Gemini API error:', error)
      throw error
    }
  }
}

// Singleton instance
let geminiClient: GeminiClient | null = null

export function getGeminiClient(): GeminiClient {
  if (!geminiClient) {
    geminiClient = new GeminiClient()
  }
  return geminiClient
}
