'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import type { NewsSource } from '@/app/actions/news-sources'

type Props = {
  source: NewsSource
  onDelete: (id: number) => Promise<void>
  onToggleActive: (id: number, isActive: boolean) => Promise<void>
}

export default function NewsCollectorItem({ source, onDelete, onToggleActive }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!confirm(`Delete "${source.name}"? This cannot be undone.`)) return
    startTransition(() => onDelete(source.id))
  }

  const handleToggle = () => {
    startTransition(() => onToggleActive(source.id, !source.is_active))
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <h3 style={{ margin: 0 }}>{source.name}</h3>
        <span
          style={{
            fontSize: '12px',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            background: source.is_active ? '#d4edda' : '#f8d7da',
            color: source.is_active ? '#155724' : '#721c24',
          }}
        >
          {source.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <p style={{ fontSize: '12px', color: '#6c757d', marginBottom: '1rem' }}>
        Type: {source.type === 'rss' ? '📡 RSS Feed' : '🔍 Tavily Search'}
      </p>

      {source.type === 'rss' && source.rss_url && (
        <div style={{ marginBottom: '0.75rem' }}>
          <strong style={{ fontSize: '14px' }}>URL:</strong>
          <p style={{ fontSize: '13px', color: '#6c757d', wordBreak: 'break-all' }}>
            {source.rss_url}
          </p>
        </div>
      )}

      {source.type === 'tavily_search' && source.tavily_query && (
        <div style={{ marginBottom: '0.75rem' }}>
          <strong style={{ fontSize: '14px' }}>Query:</strong>
          <p style={{ fontSize: '13px', color: '#6c757d' }}>
            &quot;{source.tavily_query}&quot;
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', fontSize: '13px', color: '#6c757d', marginBottom: '0.75rem' }}>
        <span>📊 {source.total_items_collected} items</span>
        <span>⏱️ {source.collection_frequency}</span>
      </div>

      {source.last_collected_at && (
        <p style={{ fontSize: '12px', color: '#6c757d' }}>
          Last collected: {new Date(source.last_collected_at).toLocaleString()}
        </p>
      )}

      {source.last_error && (
        <p style={{ fontSize: '12px', color: '#dc3545', marginTop: '0.5rem' }}>
          ⚠️ Error: {source.last_error.slice(0, 100)}...
        </p>
      )}

      <div className="actions">
        <Link href={`/news-collectors/${source.id}`}>
          <button className="button">Edit</button>
        </Link>
        <button
          className="button secondary"
          onClick={handleToggle}
          disabled={isPending}
        >
          {source.is_active ? 'Deactivate' : 'Activate'}
        </button>
        <button
          className="button danger"
          onClick={handleDelete}
          disabled={isPending}
        >
          Delete
        </button>
      </div>
    </div>
  )
}
