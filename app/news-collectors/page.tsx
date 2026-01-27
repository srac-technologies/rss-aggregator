import { getNewsSources, deleteNewsSource, toggleSourceActive } from '@/app/actions/news-sources'
import Link from 'next/link'
import NewsCollectorItem from './NewsCollectorItem'

export default async function NewsCollectorsPage() {
  const sources = await getNewsSources()

  const doDeleteSource = async (id: number) => {
    'use server'
    await deleteNewsSource(id)
  }

  const doToggleActive = async (id: number, isActive: boolean) => {
    'use server'
    await toggleSourceActive(id, isActive)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>News Collectors</h1>
        <Link href="/news-collectors/new">
          <button className="button">Create New Collector</button>
        </Link>
      </div>

      {sources.length === 0 ? (
        <div className="empty-state">
          <p>No news collectors yet. Create one to start collecting news!</p>
        </div>
      ) : (
        <div className="grid">
          {sources.map((source) => (
            <NewsCollectorItem
              key={source.id}
              source={source}
              onDelete={doDeleteSource}
              onToggleActive={doToggleActive}
            />
          ))}
        </div>
      )}
    </div>
  )
}
