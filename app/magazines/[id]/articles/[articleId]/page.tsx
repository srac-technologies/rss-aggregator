import { getCuratedArticle, getCuratedArticleSources, getMagazine } from '@/app/actions/curation'
import Link from 'next/link'
import ArticleEditor from './ArticleEditor'

export const dynamic = 'force-dynamic'

export default async function CuratedArticleDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string; articleId: string }> 
}) {
  const { id: magazineId, articleId } = await params
  const [magazine, article, sources] = await Promise.all([
    getMagazine(magazineId),
    getCuratedArticle(articleId),
    getCuratedArticleSources(articleId),
  ])

  if (!article) {
    return <div>Article not found</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <Link href={`/magazines/${magazineId}`} style={{ color: '#6c757d', fontSize: '14px', textDecoration: 'none' }}>
            ← Back to {magazine.name}
          </Link>
          <h1 style={{ marginTop: '0.5rem', marginBottom: '0.25rem' }}>{article.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              fontSize: '12px',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              background: article.status === 'published' ? '#d4edda' : '#e9ecef',
              color: article.status === 'published' ? '#155724' : '#495057',
            }}>
              {article.status}
            </span>
            <span style={{ fontSize: '14px', color: '#6c757d' }}>
              {new Date(article.created_at).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Main Content */}
        <div>
          <ArticleEditor article={article} magazineId={magazineId} />
        </div>

        {/* Sidebar - Sources */}
        <div>
          <div className="card">
            <h3>Source Articles ({sources.length})</h3>
            {sources.length === 0 ? (
              <p style={{ color: '#6c757d', fontSize: '14px' }}>No sources linked</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {sources.map((source: any) => (
                  <div 
                    key={source.id}
                    style={{
                      padding: '0.75rem',
                      background: '#f8f9fa',
                      borderRadius: '6px',
                    }}
                  >
                    <Link 
                      href={`/news/${source.news?.id}`}
                      style={{ 
                        color: '#333', 
                        textDecoration: 'none',
                        fontWeight: 500,
                        fontSize: '14px',
                        display: 'block',
                        marginBottom: '0.25rem'
                      }}
                    >
                      {source.news?.title || 'Untitled'}
                    </Link>
                    {source.relevance_score !== null && (
                      <div style={{ fontSize: '12px', color: '#6c757d' }}>
                        Relevance: {(source.relevance_score * 100).toFixed(0)}%
                      </div>
                    )}
                    {source.selection_reason && (
                      <p style={{ 
                        fontSize: '12px', 
                        color: '#6c757d',
                        margin: '0.25rem 0 0 0'
                      }}>
                        {source.selection_reason}
                      </p>
                    )}
                    {source.news?.url && (
                      <a 
                        href={source.news.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '12px', color: '#0070f3' }}
                      >
                        View original →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
