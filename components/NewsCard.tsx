import Link from 'next/link'
import type { NewsItem } from '@/app/actions/news'

interface NewsCardProps {
  news: NewsItem
}

export default function NewsCard({ news }: NewsCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPreviewText = (content: string | null, maxLength: number = 150) => {
    if (!content) return 'No content available'
    const text = content.replace(/[#*`\[\]]/g, '').trim()
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  return (
    <div className="card" style={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)'
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
    }}
    >
      <h3 style={{ 
        marginBottom: '0.75rem',
        fontSize: '1.25rem',
        lineHeight: '1.4'
      }}>
        {news.title || 'Untitled'}
      </h3>
      
      <p style={{ 
        color: '#6c757d',
        fontSize: '0.875rem',
        marginBottom: '1rem',
        flexGrow: 1
      }}>
        {getPreviewText(news.content)}
      </p>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto',
        paddingTop: '1rem',
        borderTop: '1px solid #e9ecef'
      }}>
        <span style={{ 
          color: '#6c757d',
          fontSize: '0.75rem'
        }}>
          {formatDate(news.created_at)}
        </span>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {news.url && (
            <a 
              href={news.url} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                color: '#0070f3',
                fontSize: '0.875rem',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              Source →
            </a>
          )}
          <Link 
            href={`/news/${news.id}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              color: '#0070f3',
              fontSize: '0.875rem',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            Read More →
          </Link>
        </div>
      </div>
    </div>
  )
}