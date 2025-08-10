import { getSubscription, addTagToSubscription, removeTagFromSubscription } from '@/app/actions/subscriptions'
import { getTags } from '@/app/actions/tags'
import Link from 'next/link'
import TagManager from './TagManager'

export default async function SubscriptionDetailPage({ params }: { params: { id: string } }) {
  const [subscription, allTags] = await Promise.all([
    getSubscription(params.id),
    getTags()
  ])

  const subscribedTagIds = subscription.subscriptions_tags?.map((st: any) => st.tag_id) || []
  const availableTags = allTags.filter(tag => !subscribedTagIds.includes(tag.id))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Edit Subscription</h1>
        <Link href="/subscriptions">
          <button className="button secondary">Back to List</button>
        </Link>
      </div>

      <div className="card">
        <h2>Subscription Details</h2>
        <p><strong>ID:</strong> {subscription.id}</p>
        <p><strong>Created:</strong> {new Date(subscription.created_at).toLocaleString()}</p>
        
        <div style={{ marginTop: '1rem' }}>
          <strong>RSS Feed URL:</strong>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '1rem', 
            borderRadius: '6px', 
            marginTop: '0.5rem',
            wordBreak: 'break-all'
          }}>
            <code>{`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/rss/${subscription.id}`}</code>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Assigned Tags</h2>
        {subscription.subscriptions_tags?.length > 0 ? (
          <div className="tags">
            {subscription.subscriptions_tags.map((st: any) => (
              <div key={st.tag_id} className="tag">
                {st.tags.tag}
                <form action={() => removeTagFromSubscription(subscription.id, st.tag_id)} style={{ display: 'inline' }}>
                  <button type="submit" title="Remove tag">×</button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#6c757d' }}>No tags assigned yet</p>
        )}
      </div>

      <div className="card">
        <h2>Add Tags</h2>
        {availableTags.length > 0 ? (
          <TagManager subscriptionId={subscription.id} availableTags={availableTags} />
        ) : (
          <p style={{ color: '#6c757d' }}>
            All available tags are already assigned or no tags exist.
            <Link href="/tags" style={{ color: '#0070f3', marginLeft: '0.5rem' }}>
              Create new tags
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}