import { getMagazine, getCuratedArticles, getCurationAgentSettings } from '@/app/actions/curation'
import Link from 'next/link'
import CuratedArticleCard from './CuratedArticleCard'
import AgentCard from './AgentCard'

export const dynamic = 'force-dynamic'

export default async function MagazineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [magazine, articles, agents] = await Promise.all([
    getMagazine(id),
    getCuratedArticles(id),
    getCurationAgentSettings(id),
  ])

  const publishedArticles = articles.filter((a) => a.status === 'published')
  const draftArticles = articles.filter((a) => a.status === 'draft')

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <Link href="/magazines" style={{ color: '#6c757d', fontSize: '14px', textDecoration: 'none' }}>
            ← Back to Magazines
          </Link>
          <h1 style={{ marginTop: '0.5rem', marginBottom: '0.25rem' }}>{magazine.name}</h1>
          <p style={{ color: '#6c757d', fontSize: '14px' }}>/{magazine.slug}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href={`/magazines/${id}/agents/new`}>
            <button className="button secondary">Add Agent</button>
          </Link>
          <Link href={`/prototypes/aidb?magazine=${magazine.slug}`}>
            <button className="button">Preview</button>
          </Link>
        </div>
      </div>

      {magazine.description && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <p>{magazine.description}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '0.5rem', fontSize: '14px', color: '#6c757d' }}>Published</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{publishedArticles.length}</p>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '0.5rem', fontSize: '14px', color: '#6c757d' }}>Drafts</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{draftArticles.length}</p>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '0.5rem', fontSize: '14px', color: '#6c757d' }}>Agents</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{agents.length}</p>
        </div>
      </div>

      {/* Curation Agents */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Curation Agents</h2>
          <Link href={`/magazines/${id}/agents/new`}>
            <button className="button" style={{ fontSize: '14px' }}>+ Add Agent</button>
          </Link>
        </div>
        
        {agents.length === 0 ? (
          <p style={{ color: '#6c757d' }}>No agents configured. Add one to start curating content automatically.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {agents.map((agent: any) => (
              <AgentCard key={agent.id} agent={agent} magazineId={id} />
            ))}
          </div>
        )}
      </div>

      {/* Curated Articles */}
      <div className="card">
        <h2>Curated Articles</h2>
        
        {articles.length === 0 ? (
          <p style={{ color: '#6c757d' }}>No articles yet. Run an agent to generate curated content.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {articles.map((article) => (
              <CuratedArticleCard key={article.id} article={article} magazineId={id} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
