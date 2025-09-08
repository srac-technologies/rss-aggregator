import { getNewsById } from '@/app/actions/news'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

export default async function NewsDetailPage({ params }: { params: Promise<{ newsId: number }> }) {
  const { newsId } = await params
  const news = await getNewsById(newsId)

  if (!news) {
    notFound()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <Link href="/subscriptions">
          <button className="button secondary">← Back</button>
        </Link>
        {news.url && (
          <a
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            className="button"
          >
            View Source →
          </a>
        )}
      </div>

      <article className="card" style={{ padding: '2rem' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', lineHeight: '1.3', marginBottom: '1rem' }}>
            {news.title || 'Untitled'}
          </h1>
          <div style={{
            color: '#6c757d',
            fontSize: '0.875rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #e9ecef'
          }}>
            {formatDate(news.created_at)}
          </div>
        </header>

        <div style={{
          fontSize: '1.125rem',
          lineHeight: '1.8',
          color: '#333'
        }}>
          {news.content ? (
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 style={{ fontSize: '1.75rem', marginTop: '2rem', marginBottom: '1rem' }}>{children}</h1>,
                h2: ({ children }) => <h2 style={{ fontSize: '1.5rem', marginTop: '1.75rem', marginBottom: '0.875rem' }}>{children}</h2>,
                h3: ({ children }) => <h3 style={{ fontSize: '1.25rem', marginTop: '1.5rem', marginBottom: '0.75rem' }}>{children}</h3>,
                p: ({ children }) => <p style={{ marginBottom: '1rem' }}>{children}</p>,
                ul: ({ children }) => <ul style={{ marginBottom: '1rem', paddingLeft: '2rem' }}>{children}</ul>,
                ol: ({ children }) => <ol style={{ marginBottom: '1rem', paddingLeft: '2rem' }}>{children}</ol>,
                li: ({ children }) => <li style={{ marginBottom: '0.5rem' }}>{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote style={{
                    borderLeft: '4px solid #e9ecef',
                    paddingLeft: '1rem',
                    marginLeft: '0',
                    marginBottom: '1rem',
                    fontStyle: 'italic',
                    color: '#6c757d'
                  }}>
                    {children}
                  </blockquote>
                ),
                code: ({ children, className }) => {
                  const isInline = !className
                  return isInline ? (
                    <code style={{
                      backgroundColor: '#f8f9fa',
                      padding: '0.125rem 0.25rem',
                      borderRadius: '3px',
                      fontSize: '0.875em',
                      fontFamily: 'monospace'
                    }}>
                      {children}
                    </code>
                  ) : (
                    <code style={{
                      display: 'block',
                      backgroundColor: '#f8f9fa',
                      padding: '1rem',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontFamily: 'monospace',
                      overflowX: 'auto',
                      marginBottom: '1rem'
                    }}>
                      {children}
                    </code>
                  )
                },
                pre: ({ children }) => (
                  <pre style={{
                    backgroundColor: '#f8f9fa',
                    padding: '1rem',
                    borderRadius: '6px',
                    overflow: 'auto',
                    marginBottom: '1rem'
                  }}>
                    {children}
                  </pre>
                ),
                a: ({ children, href }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#0070f3',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                  >
                    {children}
                  </a>
                )
              }}
            >
              {news.content}
            </ReactMarkdown>
          ) : (
            <p style={{ color: '#6c757d' }}>No content available for this news item.</p>
          )}
        </div>
      </article>
    </div>
  )
}
