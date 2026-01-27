import type { NewsletterStateType } from '../state'

export function checkStatus(state: NewsletterStateType): string {
  if (state.status === 'failed') {
    return 'update_newsletter'
  }
  return 'update_newsletter'
}
