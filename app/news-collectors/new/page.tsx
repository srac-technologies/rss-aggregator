'use client'

import { createNewsSource } from '@/app/actions/news-sources'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

export default function NewNewsCollectorPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [type, setType] = useState<'rss' | 'tavily_search'>('rss')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const params = {
      name: formData.get('name') as string,
      type: formData.get('type') as 'rss' | 'tavily_search',
      rssUrl: formData.get('rssUrl') as string | undefined,
      tavilyQuery: formData.get('tavilyQuery') as string | undefined,
      tavilySearchDepth: formData.get('tavilySearchDepth') as 'basic' | 'advanced' | undefined,
      tavilyDays: formData.get('tavilyDays') ? parseInt(formData.get('tavilyDays') as string) : undefined,
      collectionFrequency: formData.get('collectionFrequency') as 'hourly' | 'daily' | 'weekly' | undefined,
      autoTagEnabled: formData.get('autoTagEnabled') === 'on',
      llmProvider: formData.get('llmProvider') as 'anthropic' | 'openai' | undefined,
      llmModel: formData.get('llmModel') as string | undefined,
    }

    startTransition(async () => {
      try {
        await createNewsSource(params)
        router.push('/news-collectors')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create collector')
      }
    })
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Create News Collector</h1>
        <Link href="/news-collectors">
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
              required
              placeholder="e.g., Tech News RSS"
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Type *</label>
            <select
              id="type"
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value as 'rss' | 'tavily_search')}
            >
              <option value="rss">📡 RSS Feed</option>
              <option value="tavily_search">🔍 Tavily Search</option>
            </select>
          </div>

          {type === 'rss' && (
            <div className="form-group">
              <label htmlFor="rssUrl">RSS URL *</label>
              <input
                type="url"
                id="rssUrl"
                name="rssUrl"
                required
                placeholder="https://example.com/feed.xml"
              />
            </div>
          )}

          {type === 'tavily_search' && (
            <>
              <div className="form-group">
                <label htmlFor="tavilyQuery">Search Query *</label>
                <input
                  type="text"
                  id="tavilyQuery"
                  name="tavilyQuery"
                  required
                  placeholder="e.g., AI technology news"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tavilySearchDepth">Search Depth</label>
                <select id="tavilySearchDepth" name="tavilySearchDepth" defaultValue="basic">
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
                  defaultValue={1}
                  min={1}
                  max={30}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="collectionFrequency">Collection Frequency</label>
            <select id="collectionFrequency" name="collectionFrequency" defaultValue="hourly">
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
                defaultChecked
                style={{ width: 'auto' }}
              />
              Enable Auto-Tagging (LLM)
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="llmProvider">LLM Provider</label>
            <select id="llmProvider" name="llmProvider" defaultValue="anthropic">
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
              defaultValue="claude-3-5-haiku-20241022"
              placeholder="claude-3-5-haiku-20241022"
            />
          </div>

          <button 
            type="submit" 
            className="button" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={isPending}
          >
            {isPending ? 'Creating...' : 'Create Collector'}
          </button>
        </form>
      </div>
    </div>
  )
}
