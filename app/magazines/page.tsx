import { getMagazines } from '@/app/actions/curation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function MagazinesPage() {
  const magazines = await getMagazines()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Magazines</h1>
        <Link href="/magazines/new">
          <button className="button">Create Magazine</button>
        </Link>
      </div>

      {magazines.length === 0 ? (
        <div className="empty-state">
          <p>No magazines yet. Create one to start curating content!</p>
        </div>
      ) : (
        <div className="grid">
          {magazines.map((magazine) => (
            <Link 
              key={magazine.id} 
              href={`/magazines/${magazine.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="card" style={{ cursor: 'pointer', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: 0 }}>{magazine.name}</h3>
                  <span style={{
                    fontSize: '12px',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    background: magazine.is_published ? '#d4edda' : '#f8f9fa',
                    color: magazine.is_published ? '#155724' : '#6c757d',
                  }}>
                    {magazine.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
                
                <p style={{ fontSize: '12px', color: '#6c757d', margin: '0.5rem 0' }}>
                  /{magazine.slug}
                </p>
                
                {magazine.description && (
                  <p style={{ fontSize: '14px', color: '#495057', marginTop: '0.75rem' }}>
                    {magazine.description}
                  </p>
                )}
                
                <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '1rem' }}>
                  Created {new Date(magazine.created_at).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
