'use client'

import { createMagazine } from '@/app/actions/curation'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function NewMagazinePage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  const handleNameChange = (value: string) => {
    setName(value)
    if (!slugManuallyEdited) {
      setSlug(generateSlug(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      try {
        const magazine = await createMagazine({
          name: formData.get('name') as string,
          slug: formData.get('slug') as string,
          description: formData.get('description') as string || undefined,
        })
        router.push(`/magazines/${magazine.id}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create magazine')
      }
    })
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Create Magazine</h1>
        <Link href="/magazines">
          <button className="button secondary">Cancel</button>
        </Link>
      </div>

      <div className="card">
        {error && (
          <div style={{ 
            background: '#f8d7da', 
            color: '#721c24', 
            padding: '0.75rem', 
            borderRadius: '6px', 
            marginBottom: '1rem' 
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              placeholder="e.g., AI Weekly Digest"
            />
          </div>

          <div className="form-group">
            <label htmlFor="slug">Slug *</label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value)
                setSlugManuallyEdited(true)
              }}
              required
              placeholder="ai-weekly-digest"
            />
            <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '0.25rem' }}>
              URL-friendly identifier for the magazine
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="What is this magazine about?"
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

          <button 
            type="submit" 
            className="button" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={isPending}
          >
            {isPending ? 'Creating...' : 'Create Magazine'}
          </button>
        </form>
      </div>
    </div>
  )
}
