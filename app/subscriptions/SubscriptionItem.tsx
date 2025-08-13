'use client'

import Link from 'next/link'

type SubscriptionItemProps = {
  subscription: {
    id: string
    subscriptions_tags?: Array<{
      tag_id: string
      tags: {
        tag: string
      }
    }>
  }
  deleteSubscription: (id: string) => Promise<void>
}

export default function SubscriptionItem({ subscription, deleteSubscription }: SubscriptionItemProps) {
  return (
    <div className="card">
      <h3>Subscription</h3>
      <p style={{ fontSize: '12px', color: '#6c757d', marginBottom: '1rem' }}>
        ID: {subscription.id}
      </p>

      <div>
        <strong>Tags:</strong>
        {subscription.subscriptions_tags?.length ? (
          <div className="tags">
            {subscription.subscriptions_tags.map((st: any) => (
              <span key={st.tag_id} className="tag">
                {st.tags.tag}
              </span>
            ))}
          </div>
        ) : (
          <p style={{ color: '#6c757d', fontSize: '14px', marginTop: '0.5rem' }}>
            No tags assigned
          </p>
        )}
      </div>

      <div style={{ marginTop: '1rem' }}>
        <strong>RSS Feed URL:</strong>
        <p style={{ fontSize: '14px', wordBreak: 'break-all', color: '#0070f3' }}>
          /api/rss/{subscription.id}
        </p>
      </div>

      <div className="actions">
        <Link href={`/subscriptions/${subscription.id}`}>
          <button className="button">Edit</button>
        </Link>
        <form action={() => deleteSubscription(subscription.id)}>
          <button type="submit" className="button danger">
            Delete
          </button>
        </form>
      </div>
    </div>
  )
}
