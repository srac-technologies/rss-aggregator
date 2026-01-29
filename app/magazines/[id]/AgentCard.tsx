'use client'

import Link from 'next/link'
import { triggerCurationAgent, updateCurationAgentSetting, deleteCurationAgentSetting } from '@/app/actions/curation'
import { useState, useTransition } from 'react'

type Props = {
  agent: {
    id: string
    name: string
    is_active: boolean
    run_frequency: string
    last_run_at: string | null
    subscriptions?: { name: string | null }
  }
  magazineId: string
}

export default function AgentCard({ agent, magazineId }: Props) {
  const [isPending, startTransition] = useTransition()
  const [runResult, setRunResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleRun = () => {
    setRunResult(null)
    startTransition(async () => {
      try {
        const result = await triggerCurationAgent(agent.id)
        setRunResult({
          success: result.errors.length === 0,
          message: result.errors.length === 0
            ? `Created article with ${result.articlesAccepted} sources`
            : result.errors.join('; ')
        })
        setTimeout(() => setRunResult(null), 5000)
      } catch (err) {
        setRunResult({
          success: false,
          message: err instanceof Error ? err.message : 'Failed to run agent'
        })
      }
    })
  }

  const handleToggle = () => {
    startTransition(async () => {
      await updateCurationAgentSetting(agent.id, { is_active: !agent.is_active })
    })
  }

  const handleDelete = () => {
    if (!confirm(`Delete agent "${agent.name}"?`)) return
    startTransition(async () => {
      await deleteCurationAgentSetting(agent.id)
    })
  }

  return (
    <div style={{
      padding: '0.75rem',
      background: '#f8f9fa',
      borderRadius: '6px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontWeight: 500 }}>{agent.name}</span>
            <span style={{
              fontSize: '12px',
              padding: '0.15rem 0.4rem',
              borderRadius: '3px',
              background: agent.is_active ? '#d4edda' : '#f8d7da',
              color: agent.is_active ? '#155724' : '#721c24',
            }}>
              {agent.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div style={{ fontSize: '13px', color: '#6c757d' }}>
            <span>Source: {agent.subscriptions?.name || 'Unknown'}</span>
            <span style={{ margin: '0 0.5rem' }}>•</span>
            <span>Frequency: {agent.run_frequency}</span>
            {agent.last_run_at && (
              <>
                <span style={{ margin: '0 0.5rem' }}>•</span>
                <span>Last run: {new Date(agent.last_run_at).toLocaleString()}</span>
              </>
            )}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="button" 
            style={{ fontSize: '12px', padding: '0.25rem 0.5rem' }}
            onClick={handleRun}
            disabled={isPending}
          >
            {isPending ? 'Running...' : '▶ Run'}
          </button>
          <button 
            className="button secondary" 
            style={{ fontSize: '12px', padding: '0.25rem 0.5rem' }}
            onClick={handleToggle}
            disabled={isPending}
          >
            {agent.is_active ? 'Disable' : 'Enable'}
          </button>
          <Link href={`/magazines/${magazineId}/agents/${agent.id}`}>
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
      
      {runResult && (
        <div style={{
          marginTop: '0.5rem',
          padding: '0.5rem',
          borderRadius: '4px',
          fontSize: '13px',
          background: runResult.success ? '#d4edda' : '#f8d7da',
          color: runResult.success ? '#155724' : '#721c24',
        }}>
          {runResult.message}
        </div>
      )}
    </div>
  )
}
