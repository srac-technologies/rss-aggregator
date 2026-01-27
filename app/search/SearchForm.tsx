'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

type Props = {
  initialQuery: string
}

export default function SearchForm({ initialQuery }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(() => {
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      } else {
        router.push('/search')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title or content..."
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '16px'
          }}
        />
        <button 
          type="submit" 
          className="button"
          disabled={isPending}
          style={{ padding: '0.75rem 1.5rem' }}
        >
          {isPending ? 'Searching...' : 'Search'}
        </button>
      </div>
    </form>
  )
}
