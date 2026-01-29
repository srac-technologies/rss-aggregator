'use client'

import Link from 'next/link'
import { updateCuratedArticle, deleteCuratedArticle } from '@/app/actions/curation'
import { useTransition } from 'react'

type Props = {
  article: {
    id: string
    title: string
    summary: string | null
    status: string
    published_at: string | null
    created_at: string
    source_count?: number
  }
  magazineId: string
}

export default function CuratedArticleCard({ article, magazineId }: Props) {
  const [isPending, startTransition] = useTransition()

  const handlePublish = () => {
    startTransition(async () => {
      await updateCuratedArticle(article.id, { status: 'published' })
    })
  }

  const handleUnpublish = () => {
    startTransition(async () => {
      await updateCuratedArticle(article.id, { status: 'draft' })
    })
  }

  const handleDelete = () => {
    if (!confirm('Delete this article?')) return
    startTransition(async () => {
      await deleteCuratedArticle(article.id)
    })
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem',
      background: '#f8f9fa',
      borderRadius: '6px',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{
            fontSize: '12px',
            padding: '0.15rem 0.4rem',
            borderRadius: '3px',
            background: article.status === 'published' ? '#d4edda' : '#e9ecef',
            color: article.status === 'published' ? '#155724' : '#495057',
          }}>
            {article.status}
          </span>
          {article.source_count !== undefined && (
            <span style={{ fontSize: '12px', color: '#6c757d' }}>
              {article.source_count} sources
            </span>
          )}
        </div>
        <Link 
          href={`/magazines/${magazineId}/articles/${article.id}`}
          style={{ color: '#333', textDecoration: 'none', fontWeight: 500 }}
        >
          {article.title}
        </Link>
        {article.summary && (
          <p style={{ 
            fontSize: '13px', 
            color: '#6c757d', 
            margin: '0.25rem 0 0 0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {article.summary}
          </p>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
        {article.status === 'draft' ? (
          <button 
            className="button" 
            style={{ fontSize: '12px', padding: '0.25rem 0.5rem' }}
            onClick={handlePublish}
            disabled={isPending}
          >
            Publish
          </button>
        ) : (
          <button 
            className="button secondary" 
            style={{ fontSize: '12px', padding: '0.25rem 0.5rem' }}
            onClick={handleUnpublish}
            disabled={isPending}
          >
            Unpublish
          </button>
        )}
        <Link href={`/magazines/${magazineId}/articles/${article.id}`}>
          <button className="button secondary" style={{ fontSize: '12px', padding: '0.25rem 0.5rem' }}>
            Edit
          </button>
        </Link>
        <button 
          className="button danger" 
          style={{ fontSize: '12px', padding: '0.25rem 0.5rem' }}
          onClick={handleDelete}
          disabled={isPending}
        >
          Delete
        </button>
      </div>
    </div>
  )
}
