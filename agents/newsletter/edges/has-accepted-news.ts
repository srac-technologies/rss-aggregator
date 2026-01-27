import type { NewsletterStateType } from '../state'
import { END } from '@langchain/langgraph'

export function hasAcceptedNews(state: NewsletterStateType): typeof END | string {
  if (state.acceptedNewsIds.length === 0) {
    return END
  }
  return 'generate_summary'
}
