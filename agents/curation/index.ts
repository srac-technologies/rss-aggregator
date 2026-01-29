import { curationGraph } from './graph'
import type { CurationStateType } from './state'

export interface CurationResult {
  curatedArticleId: string | null
  articlesEvaluated: number
  articlesAccepted: number
  articlesRejected: number
  tokensUsed: number
  errors: string[]
}

export async function runCurationAgent(agentSettingId: string): Promise<CurationResult> {
  const initialState: Partial<CurationStateType> = {
    agentSettingId,
  }

  const result = await curationGraph.invoke(initialState)

  return {
    curatedArticleId: result.curatedArticleId,
    articlesEvaluated: result.articlesEvaluated,
    articlesAccepted: result.articlesAccepted,
    articlesRejected: result.articlesRejected,
    tokensUsed: result.tokensUsed,
    errors: result.errors,
  }
}

export { curationGraph }
export type { CurationStateType }
