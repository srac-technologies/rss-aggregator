'use client'

import type { CollectionRun } from '@/app/actions/news-sources'

type Props = {
  runs: CollectionRun[]
}

export default function CollectionRunsList({ runs }: Props) {
  if (runs.length === 0) {
    return <p style={{ color: '#6c757d' }}>No collection runs yet.</p>
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #dee2e6' }}>
            <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem' }}>Started</th>
            <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem' }}>Status</th>
            <th style={{ textAlign: 'right', padding: '0.75rem 0.5rem' }}>Fetched</th>
            <th style={{ textAlign: 'right', padding: '0.75rem 0.5rem' }}>New</th>
            <th style={{ textAlign: 'right', padding: '0.75rem 0.5rem' }}>Duration</th>
            <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem' }}>Error</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <tr key={run.id} style={{ borderBottom: '1px solid #dee2e6' }}>
              <td style={{ padding: '0.75rem 0.5rem' }}>
                {new Date(run.started_at).toLocaleString()}
              </td>
              <td style={{ padding: '0.75rem 0.5rem' }}>
                <span style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '12px',
                  background: run.status === 'completed' ? '#d4edda' 
                    : run.status === 'failed' ? '#f8d7da' 
                    : '#fff3cd',
                  color: run.status === 'completed' ? '#155724' 
                    : run.status === 'failed' ? '#721c24' 
                    : '#856404',
                }}>
                  {run.status}
                </span>
              </td>
              <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                {run.items_fetched ?? '-'}
              </td>
              <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                {run.items_new ?? '-'}
              </td>
              <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                {run.duration_ms ? `${(run.duration_ms / 1000).toFixed(1)}s` : '-'}
              </td>
              <td style={{ 
                padding: '0.75rem 0.5rem', 
                color: '#dc3545',
                maxWidth: '200px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {run.error_message || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
