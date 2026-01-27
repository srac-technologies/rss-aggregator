import { getNewsSource, getCollectionRuns, triggerCollection } from '@/app/actions/news-sources'
import Link from 'next/link'
import CollectorForm from './CollectorForm'
import TriggerButton from './TriggerButton'
import CollectionRunsList from './CollectionRunsList'

export default async function NewsCollectorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sourceId = parseInt(id)
  
  const [source, runs] = await Promise.all([
    getNewsSource(sourceId),
    getCollectionRuns(sourceId, 20)
  ])

  const doTriggerCollection = async () => {
    'use server'
    return triggerCollection(sourceId)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <Link href="/news-collectors" style={{ color: '#6c757d', fontSize: '14px', textDecoration: 'none' }}>
            ← Back to Collectors
          </Link>
          <h1 style={{ marginTop: '0.5rem', marginBottom: 0 }}>{source.name}</h1>
          <p style={{ color: '#6c757d', fontSize: '14px' }}>
            {source.type === 'rss' ? '📡 RSS Feed' : '🔍 Tavily Search'}
            {' • '}
            {source.is_active ? (
              <span style={{ color: '#155724' }}>Active</span>
            ) : (
              <span style={{ color: '#721c24' }}>Inactive</span>
            )}
          </p>
        </div>
        <TriggerButton onTrigger={doTriggerCollection} />
      </div>

      {/* Stats */}
      <div className="grid" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '0.5rem', fontSize: '14px', color: '#6c757d' }}>Total Collected</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{source.total_items_collected}</p>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '0.5rem', fontSize: '14px', color: '#6c757d' }}>Frequency</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, textTransform: 'capitalize' }}>
            {source.collection_frequency}
          </p>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '0.5rem', fontSize: '14px', color: '#6c757d' }}>Last Collected</h3>
          <p style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>
            {source.last_collected_at 
              ? new Date(source.last_collected_at).toLocaleString() 
              : 'Never'}
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {source.last_error && (
        <div className="card" style={{ background: '#f8d7da', border: '1px solid #f5c6cb', marginBottom: '2rem' }}>
          <h3 style={{ color: '#721c24', marginBottom: '0.5rem' }}>⚠️ Last Error</h3>
          <p style={{ color: '#721c24', margin: 0, fontSize: '14px' }}>{source.last_error}</p>
        </div>
      )}

      {/* Edit Form */}
      <div className="card">
        <h2>Settings</h2>
        <CollectorForm source={source} />
      </div>

      {/* Collection Runs */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h2>Recent Collection Runs</h2>
        <CollectionRunsList runs={runs} />
      </div>
    </div>
  )
}
