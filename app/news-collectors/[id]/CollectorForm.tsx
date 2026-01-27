'use client'

import { updateNewsSource, deleteNewsSource, toggleSourceActive } from '@/app/actions/news-sources'
import type { NewsSource } from '@/app/actions/news-sources'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

type Props = {
  source: NewsSource
}

export default function CollectorForm({ source }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    
    const updates: Partial<NewsSource> = {
      name: formData.get('name') as string,
      collection_frequency: formData.get('collectionFrequency') as 'hourly' | 'daily' | 'weekly',
      auto_tag_enabled: formData.get('autoTagEnabled') === 'on',
      llm_provider: formData.get('llmProvider') as 'anthropic' | 'openai',
      llm_model: formData.get('llmModel') as string,
    }

    if (source.type === 'rss') {
      updates.rss_url = formData.get('rssUrl') as string
    } else {
      updates.tavily_query = formData.get('tavilyQuery') as string
      updates.tavily_search_depth = formData.get('tavilySearchDepth') as 'basic' | 'advanced'
      updates.tavily_days = parseInt(formData.get('tavilyDays') as string)
    }

    startTransition(async () => {
      try {
        await updateNewsSource(source.id, updates)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update collector')
      }
    })
  }

  const handleDelete = () => {
    if (!confirm(`Delete "${source.name}"? This cannot be undone.`)) return
    
    startTransition(async () => {
      try {
        await deleteNewsSource(source.id)
        router.push('/news-collectors')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete collector')
      }
    })
  }

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await toggleSourceActive(source.id, !source.is_active)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to toggle status')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
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

      {success && (
        <div style={{ 
          background: '#d4edda', 
          color: '#155724', 
          padding: '0.75rem', 
          borderRadius: '6px', 
          marginBottom: '1rem' 
        }}>
          Settings saved successfully!
        </div>
      )}

      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={source.name}
          required
        />
      </div>

      {source.type === 'rss' && (
        <div className="form-group">
          <label htmlFor="rssUrl">RSS URL</label>
          <input
            type="url"
            id="rssUrl"
            name="rssUrl"
            defaultValue={source.rss_url || ''}
            required
          />
        </div>
      )}

      {source.type === 'tavily_search' && (
        <>
          <div className="form-group">
            <label htmlFor="tavilyQuery">Search Query</label>
            <input
              type="text"
              id="tavilyQuery"
              name="tavilyQuery"
              defaultValue={source.tavily_query || ''}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tavilySearchDepth">Search Depth</label>
            <select 
              id="tavilySearchDepth" 
              name="tavilySearchDepth" 
              defaultValue={source.tavily_search_depth}
            >
              <option value="basic">Basic</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tavilyDays">Days to Search</label>
            <input
              type="number"
              id="tavilyDays"
              name="tavilyDays"
              defaultValue={source.tavily_days}
              min={1}
              max={30}
            />
          </div>
        </>
      )}

      <div className="form-group">
        <label htmlFor="collectionFrequency">Collection Frequency</label>
        <select 
          id="collectionFrequency" 
          name="collectionFrequency" 
          defaultValue={source.collection_frequency || 'hourly'}
        >
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>

      <div className="form-group">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            name="autoTagEnabled"
            defaultChecked={source.auto_tag_enabled || false}
            style={{ width: 'auto' }}
          />
          Enable Auto-Tagging (LLM)
        </label>
      </div>

      <div className="form-group">
        <label htmlFor="llmProvider">LLM Provider</label>
        <select 
          id="llmProvider" 
          name="llmProvider" 
          defaultValue={source.llm_provider || 'anthropic'}
        >
          <option value="anthropic">Anthropic</option>
          <option value="openai">OpenAI</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="llmModel">LLM Model</label>
        <input
          type="text"
          id="llmModel"
          name="llmModel"
          defaultValue={source.llm_model || 'claude-3-5-haiku-20241022'}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
        <button 
          type="submit" 
          className="button"
          disabled={isPending}
        >
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          className="button secondary"
          onClick={handleToggle}
          disabled={isPending}
        >
          {source.is_active ? 'Deactivate' : 'Activate'}
        </button>
        <button
          type="button"
          className="button danger"
          onClick={handleDelete}
          disabled={isPending}
        >
          Delete
        </button>
      </div>
    </form>
  )
}
