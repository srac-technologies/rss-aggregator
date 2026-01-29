import type { CurationStateType } from '../state'
import { END } from '@langchain/langgraph'

export function shouldContinueAfterFetch(state: CurationStateType): string {
  if (!state.shouldContinue || state.errors.length > 0) {
    return 'finalize_run'
  }
  if (state.sourceArticles.length === 0) {
    return 'finalize_run'
  }
  return 'evaluate_articles'
}

export function shouldContinueAfterEvaluate(state: CurationStateType): string {
  if (!state.shouldContinue || state.errors.length > 0) {
    return 'finalize_run'
  }
  if (state.acceptedArticles.length === 0) {
    return 'finalize_run'
  }
  return 'generate_curation'
}

export function shouldContinueAfterGenerate(state: CurationStateType): string {
  if (!state.shouldContinue || state.errors.length > 0) {
    return 'finalize_run'
  }
  if (!state.curatedContent) {
    return 'finalize_run'
  }
  return 'save_curation'
}
