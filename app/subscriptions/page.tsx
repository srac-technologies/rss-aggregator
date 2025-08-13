import { getSubscriptions, createSubscription } from '@/app/actions/subscriptions'
import Link from 'next/link'
import DeleteSubscriptionButton from './DeleteButton'

export default async function SubscriptionsPage() {
  const subscriptions = await getSubscriptions()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Subscriptions</h1>
        <form action={() => createSubscription()}>
          <button type="submit" className="button">
            Create New Subscription
          </button>
        </form>
      </div>

      {subscriptions.length === 0 ? (
        <div className="empty-state">
          <p>No subscriptions yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid">
          {subscriptions.map((subscription) => (
            <div key={subscription.id} className="card">
              <h3>Subscription</h3>
              <p style={{ fontSize: '12px', color: '#6c757d', marginBottom: '1rem' }}>
                ID: {subscription.id}
              </p>

              <div>
                <strong>Tags:</strong>
                {subscription.subscriptions_tags?.length > 0 ? (
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
                <DeleteSubscriptionButton id={subscription.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
