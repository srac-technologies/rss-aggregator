'use client'

import { useState, useTransition } from 'react'

type Props = {
  onTrigger: () => Promise<{ success: boolean; itemsNew?: number; itemsFetched?: number }>
}

export default function TriggerButton({ onTrigger }: Props) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleClick = () => {
    setResult(null)
    startTransition(async () => {
      try {
        const res = await onTrigger()
        setResult({
          success: true,
          message: `Collected ${res.itemsNew || 0} new items (${res.itemsFetched || 0} fetched)`
        })
        setTimeout(() => setResult(null), 5000)
      } catch (err) {
        setResult({
          success: false,
          message: err instanceof Error ? err.message : 'Collection failed'
        })
      }
    })
  }

  return (
    <div>
      <button 
        className="button" 
        onClick={handleClick}
        disabled={isPending}
      >
        {isPending ? '⏳ Collecting...' : '▶️ Run Now'}
      </button>
      {result && (
        <div style={{
          marginTop: '0.5rem',
          padding: '0.5rem',
          borderRadius: '4px',
          fontSize: '13px',
          background: result.success ? '#d4edda' : '#f8d7da',
          color: result.success ? '#155724' : '#721c24',
        }}>
          {result.message}
        </div>
      )}
    </div>
  )
}
