'use client'

type Props = {
  id: string,
  deleteSubscription: (id: string) => Promise<void>
}

export default function DeleteSubscriptionButton({ id, deleteSubscription }: Props) {
  return (
    <form action={() => deleteSubscription(id)}>
      <button type="submit" className="button danger">
        Delete
      </button>
    </form>
  )
}
