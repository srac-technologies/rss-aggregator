import { newsCollectorGraph } from './graph'
import type { NewsCollectorStateType } from './state'

export interface CollectionResult {
  itemsFetched: number
  itemsNew: number
  itemsSkipped: number
  tokensUsed: number
  errors: string[]
}

export async function runNewsCollector(sourceId: number): Promise<CollectionResult> {
  const initialState: Partial<NewsCollectorStateType> = {
    sourceId,
  }

  const result = await newsCollectorGraph.invoke(initialState)

  return {
    itemsFetched: result.itemsFetched,
    itemsNew: result.itemsNew,
    itemsSkipped: result.itemsSkipped,
    tokensUsed: result.tokensUsed,
    errors: result.errors,
  }
}

export { newsCollectorGraph }
export type { NewsCollectorStateType }
