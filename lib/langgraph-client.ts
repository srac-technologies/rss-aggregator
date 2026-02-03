/**
 * LangGraph Cloud REST API Client
 * Simple client for invoking LangGraph deployments
 */

const LANGGRAPH_API_URL = process.env.LANGGRAPH_API_URL
const LANGGRAPH_API_KEY = process.env.LANGGRAPH_API_KEY

interface RunInput {
  [key: string]: unknown
}

interface RunResponse {
  run_id: string
  thread_id: string
  status: 'pending' | 'running' | 'error' | 'success' | 'timeout' | 'interrupted'
  created_at: string
  updated_at: string
}

interface RunResult {
  run_id: string
  status: string
  result: unknown
  error?: string
}

class LangGraphClient {
  private baseUrl: string
  private apiKey?: string

  constructor(baseUrl?: string, apiKey?: string) {
    this.baseUrl = baseUrl || LANGGRAPH_API_URL || ''
    this.apiKey = apiKey || LANGGRAPH_API_KEY
    
    if (!this.baseUrl) {
      throw new Error('LANGGRAPH_API_URL environment variable is not set')
    }
  }

  private async fetch(path: string, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.apiKey) {
      headers['x-api-key'] = this.apiKey
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`LangGraph API error: ${response.status} - ${error}`)
    }

    return response
  }

  /**
   * Create a new run for an assistant (graph)
   */
  async createRun(assistantId: string, input: RunInput): Promise<RunResponse> {
    const response = await this.fetch(`/assistants/${assistantId}/runs`, {
      method: 'POST',
      body: JSON.stringify({ input }),
    })

    return response.json()
  }

  /**
   * Wait for a run to complete and return the result
   */
  async waitForRun(runId: string, timeoutMs = 300000): Promise<RunResult> {
    const startTime = Date.now()
    
    while (Date.now() - startTime < timeoutMs) {
      const response = await this.fetch(`/runs/${runId}`)
      const run: RunResponse & { result?: unknown; error?: string } = await response.json()

      if (run.status === 'success') {
        return {
          run_id: run.run_id,
          status: run.status,
          result: run.result,
        }
      }

      if (run.status === 'error' || run.status === 'timeout' || run.status === 'interrupted') {
        return {
          run_id: run.run_id,
          status: run.status,
          result: null,
          error: run.error || `Run ${run.status}`,
        }
      }

      // Wait before polling again
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    throw new Error(`Run ${runId} timed out after ${timeoutMs}ms`)
  }

  /**
   * Create a run and wait for it to complete
   */
  async invoke(assistantId: string, input: RunInput, timeoutMs = 300000): Promise<RunResult> {
    const run = await this.createRun(assistantId, input)
    return this.waitForRun(run.run_id, timeoutMs)
  }

  /**
   * Stream run results (Server-Sent Events)
   */
  async *streamRun(assistantId: string, input: RunInput): AsyncGenerator<unknown> {
    const response = await this.fetch(`/assistants/${assistantId}/runs/stream`, {
      method: 'POST',
      body: JSON.stringify({ input }),
    })

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data && data !== '[DONE]') {
            yield JSON.parse(data)
          }
        }
      }
    }
  }
}

// Singleton instance
let client: LangGraphClient | null = null

export function getLangGraphClient(): LangGraphClient {
  if (!client) {
    client = new LangGraphClient()
  }
  return client
}

export { LangGraphClient }
export type { RunInput, RunResponse, RunResult }
