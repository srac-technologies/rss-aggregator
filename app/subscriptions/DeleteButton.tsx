'use client'

import { deleteSubscription } from '@/app/actions/subscriptions'

export default function DeleteSubscriptionButton({ id }: { id: string }) {
  return (
    <form action={() => deleteSubscription(id)}>
      <button type="submit" className="button danger">
        Delete
      </button>
    </form>
  )
}