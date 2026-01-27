import { getSubscription, addTagToSubscription, removeTagFromSubscription } from '@/app/actions/subscriptions'
import { getTags } from '@/app/actions/tags'
import { getNewsBySubscription } from '@/app/actions/news'
import Link from 'next/link'
import TagManager from './TagManager'
import { RemoveTag } from './RemoveTag'
import NewsCard from '@/components/NewsCard'

export default async function SubscriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [subscription, allTags, newsItems] = await Promise.all([
    getSubscription(id),
    getTags(),
    getNewsBySubscription(id, 10)
  ])

  const subscribedTagIds = subscription.subscriptions_tags?.map((st: any) => st.tag_id) || []
  const availableTags = allTags.filter(tag => !subscribedTagIds.includes(tag.id))

  const doRemoveTagFromSubscription = async (subscriptionId: string, tagId: number) => {
    'use server'
    await removeTagFromSubscription(subscriptionId, tagId)
  }

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

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Recent News Preview</h2>
        {newsItems.length > 0 ? (
          <div className="grid">
            {newsItems.map((news) => (
              <NewsCard key={news.id} news={news} />
            ))}
          </div>
        ) : (
          <div className="card">
            <p style={{ color: '#6c757d' }}>No news items found for this subscription.</p>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Assigned Tags</h2>
        {subscription.subscriptions_tags?.length > 0 ? (
          <div className="tags">
            {subscription.subscriptions_tags.map((st: any) => (
              <RemoveTag
                key={st.tag_id}
                subscriptionTag={st}
                subscriptionId={subscription.id}
                removeTagFromSubscription={doRemoveTagFromSubscription}
              />
            ))}
          </div>
        ) : (
          <p style={{ color: '#6c757d' }}>No tags assigned yet</p>
        )}
      </div>

      <div className="card">
        <h2>Add Tags</h2>
        {availableTags.length > 0 ? (
          <TagManager subscriptionId={subscription.id} availableTags={availableTags} doHandleAddTag={addTagToSubscription} />
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
