import type { NewsletterStateType } from '../state'
import { END } from '@langchain/langgraph'

export function hasNews(state: NewsletterStateType): typeof END | string {
  if (!state.availableNews || state.availableNews.length === 0) {
    return END
  }
  return 'filter_news'
}
