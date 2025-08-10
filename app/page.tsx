import Link from 'next/link'

export default function Home() {
  return (
    <main>
      <h1>RSS Aggregator</h1>
      <p style={{ fontSize: '18px', marginBottom: '2rem' }}>
        Manage subscriptions and tags to create personalized RSS feeds from your news database.
      </p>

      <div className="grid">
        <div className="card">
          <h2>📋 Subscriptions</h2>
          <p>Create and manage RSS feed subscriptions. Each subscription can have multiple tags to filter news content.</p>
          <Link href="/subscriptions">
            <button className="button" style={{ marginTop: '1rem' }}>
              Manage Subscriptions
            </button>
          </Link>
        </div>

        <div className="card">
          <h2>🏷️ Tags</h2>
          <p>Create and manage tags that can be assigned to subscriptions to filter news items.</p>
          <Link href="/tags">
            <button className="button" style={{ marginTop: '1rem' }}>
              Manage Tags
            </button>
          </Link>
        </div>

        <div className="card">
          <h2>📡 RSS Feeds</h2>
          <p>Access RSS feeds at:</p>
          <code style={{ 
            display: 'block', 
            background: '#f5f5f5', 
            padding: '0.5rem',
            borderRadius: '4px',
            marginTop: '0.5rem',
            fontSize: '14px'
          }}>
            /api/rss/[subscriptionId]
          </code>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2>How it works</h2>
        <ol style={{ lineHeight: '2' }}>
          <li>Create tags that categorize your news content</li>
          <li>Create a subscription and assign relevant tags to it</li>
          <li>News items tagged with those tags will appear in the subscription's RSS feed</li>
          <li>Access the RSS feed using the subscription ID in the URL</li>
        </ol>
      </div>

      <div className="card">
        <h2>Features</h2>
        <ul style={{ lineHeight: '2' }}>
          <li>✅ 1-hour caching for optimal performance</li>
          <li>✅ Queries data from Supabase rss_feed view</li>
          <li>✅ Returns valid RSS 2.0 XML format</li>
          <li>✅ Cache status indicated in X-Cache header</li>
          <li>✅ Server-side rendering with Next.js App Router</li>
          <li>✅ Server actions for data mutations</li>
        </ul>
      </div>
    </main>
  )
}