import Link from 'next/link'
import { getAllNews } from './actions/news'
import NewsCard from '@/components/NewsCard'

export default async function Home() {
  const newsItems = await getAllNews(50)

  return (
    <main>
      <h1>RSS News Reader</h1>
      <p style={{ fontSize: '18px', marginBottom: '2rem' }}>
        Browse the latest news from all sources
      </p>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '2rem' 
        }}>
          <Link href="/subscriptions">
            <button className="button">📋 Manage Subscriptions</button>
          </Link>
          <Link href="/tags">
            <button className="button secondary">🏷️ Manage Tags</button>
          </Link>
        </div>
      </div>

      <section>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.75rem' }}>Latest News</h2>
        
        {newsItems.length > 0 ? (
          <>
            <div className="grid" style={{ marginBottom: '2rem' }}>
              {newsItems.map((news) => (
                <NewsCard key={news.id} news={news} />
              ))}
            </div>
            
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem',
              color: '#6c757d'
            }}>
              <p>Showing {newsItems.length} most recent items</p>
            </div>
          </>
        ) : (
          <div className="card">
            <div className="empty-state">
              <h3>No news items found</h3>
              <p>News items will appear here once they are added to the database.</p>
            </div>
          </div>
        )}
      </section>

      <section style={{ marginTop: '4rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>How it works</h2>
        
        <div className="grid">
          <div className="card">
            <h3>1. Create Tags</h3>
            <p>Tags categorize your news content for easy filtering and organization.</p>
          </div>
          
          <div className="card">
            <h3>2. Create Subscriptions</h3>
            <p>Subscriptions group tags together to create personalized RSS feeds.</p>
          </div>
          
          <div className="card">
            <h3>3. Access RSS Feeds</h3>
            <p>Each subscription generates a unique RSS feed URL at:</p>
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
      </section>

      <section className="card" style={{ marginTop: '2rem' }}>
        <h2>Features</h2>
        <ul style={{ lineHeight: '2' }}>
          <li>✅ Browse all news in one place</li>
          <li>✅ Full markdown rendering support</li>
          <li>✅ Tag-based categorization</li>
          <li>✅ 1-hour caching for optimal performance</li>
          <li>✅ Server-side rendering with Next.js App Router</li>
          <li>✅ Personalized RSS feeds based on tags</li>
          <li>✅ Server actions for real-time updates</li>
        </ul>
      </section>
    </main>
  )
}