import Link from 'next/link'

export default function PrototypesPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>UI Prototypes</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Various UI prototypes for the RSS Aggregator
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Link 
          href="/prototypes/aidb"
          style={{
            display: 'block',
            padding: '1.5rem',
            background: '#fff',
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <h2 style={{ margin: '0 0 0.5rem 0' }}>AIDB Style</h2>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            ai-data-base.com を参考にしたUI
          </p>
        </Link>
      </div>
    </div>
  )
}
