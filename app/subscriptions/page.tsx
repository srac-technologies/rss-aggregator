import { getSubscriptions, createSubscription, deleteSubscription } from '@/app/actions/subscriptions'
import SubscriptionItem from './SubscriptionItem'

export default async function SubscriptionsPage() {
  const subscriptions = await getSubscriptions()
  const doCreateSubscription = async () => {
    'use server'
    const newSubscription = await createSubscription()
    return newSubscription
  }

  const doDeleteSubscription = async (id: string) => {
    'use server'
    await deleteSubscription(id)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Subscriptions</h1>
        <form action={doCreateSubscription}>
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
            <SubscriptionItem
              key={subscription.id}
              subscription={subscription}
              deleteSubscription={doDeleteSubscription.bind(null, subscription.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
