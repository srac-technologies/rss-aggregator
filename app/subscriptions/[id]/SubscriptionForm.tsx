'use client'

import { updateSubscription } from '@/app/actions/subscriptions'
import { useState, useTransition } from 'react'

type Props = {
  subscription: {
    id: string
    name: string | null
    description: string | null
  }
}

export default function SubscriptionForm({ subscription }: Props) {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSuccess(false)
    
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const description = formData.get('description') as string

    startTransition(async () => {
      await updateSubscription(subscription.id, { 
        name: name || null, 
        description: description || null 
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {success && (
        <div style={{ 
          background: '#d4edda', 
          color: '#155724', 
          padding: '0.75rem', 
          borderRadius: '6px', 
          marginBottom: '1rem' 
        }}>
          Saved!
        </div>
      )}

      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={subscription.name || ''}
          placeholder="Enter subscription name..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <input
          type="text"
          id="description"
          name="description"
          defaultValue={subscription.description || ''}
          placeholder="Optional description..."
        />
      </div>

      <button type="submit" className="button" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
