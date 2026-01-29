'use client'

import { updateCuratedArticle, deleteCuratedArticle } from '@/app/actions/curation'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

type Props = {
  article: {
    id: string
    title: string
    content: string
    summary: string | null
    status: string
  }
  magazineId: string
}

export default function ArticleEditor({ article, magazineId }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [title, setTitle] = useState(article.title)
  const [summary, setSummary] = useState(article.summary || '')
  const [content, setContent] = useState(article.content)

  const handleSave = () => {
    setSuccess(false)
    startTransition(async () => {
      await updateCuratedArticle(article.id, { title, summary, content })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    })
  }

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
      router.push(`/magazines/${magazineId}`)
    })
  }

  return (
    <div className="card">
      {success && (
        <div style={{ 
          background: '#d4edda', 
          color: '#155724', 
          padding: '0.75rem', 
          borderRadius: '6px', 
          marginBottom: '1rem' 
        }}>
          Saved!
        </div>
      )}

      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="summary">Summary</label>
        <textarea
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            resize: 'vertical'
          }}
        />
      </div>

      <div className="form-group">
        <label htmlFor="content">Content (Markdown)</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={20}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'monospace',
            resize: 'vertical'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
        <button 
          className="button" 
          onClick={handleSave}
          disabled={isPending}
        >
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
        
        {article.status === 'draft' ? (
          <button 
            className="button secondary" 
            onClick={handlePublish}
            disabled={isPending}
          >
            Publish
          </button>
        ) : (
          <button 
            className="button secondary" 
            onClick={handleUnpublish}
            disabled={isPending}
          >
            Unpublish
          </button>
        )}
        
        <button 
          className="button danger" 
          onClick={handleDelete}
          disabled={isPending}
          style={{ marginLeft: 'auto' }}
        >
          Delete
        </button>
      </div>
    </div>
  )
}
