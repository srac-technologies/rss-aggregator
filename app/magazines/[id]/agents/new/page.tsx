'use client'

import { createCurationAgentSetting } from '@/app/actions/curation'
import { getSubscriptions } from '@/app/actions/subscriptions'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState, useTransition, useEffect } from 'react'

export default function NewAgentPage() {
  const params = useParams()
  const magazineId = params.id as string
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [subscriptions, setSubscriptions] = useState<any[]>([])

  useEffect(() => {
    getSubscriptions().then(setSubscriptions)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      try {
        await createCurationAgentSetting({
          name: formData.get('name') as string,
          magazine_id: magazineId,
          subscription_id: formData.get('subscription_id') as string,
          selection_prompt: formData.get('selection_prompt') as string,
          curation_prompt: formData.get('curation_prompt') as string,
          llm_provider: formData.get('llm_provider') as string,
          llm_model: formData.get('llm_model') as string,
          run_frequency: formData.get('run_frequency') as string,
        })
        router.push(`/magazines/${magazineId}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create agent')
      }
    })
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <Link href={`/magazines/${magazineId}`} style={{ color: '#6c757d', fontSize: '14px', textDecoration: 'none' }}>
            ← Back to Magazine
          </Link>
          <h1 style={{ marginTop: '0.5rem' }}>Create Curation Agent</h1>
        </div>
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
            <label htmlFor="name">Agent Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="e.g., AI News Curator"
            />
          </div>

          <div className="form-group">
            <label htmlFor="subscription_id">Source Subscription *</label>
            <select id="subscription_id" name="subscription_id" required>
              <option value="">Select a subscription...</option>
              {subscriptions.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name || sub.id}
                </option>
              ))}
            </select>
            <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '0.25rem' }}>
              The agent will curate articles from this subscription
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="selection_prompt">Selection Criteria *</label>
            <textarea
              id="selection_prompt"
              name="selection_prompt"
              required
              rows={4}
              placeholder="Describe what makes an article worth including..."
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical'
              }}
              defaultValue={`以下の基準で記事を選定してください：
- AIや機械学習に関する技術的な内容
- 実用的な知見や新しい研究成果
- 読者にとって価値のある情報`}
            />
          </div>

          <div className="form-group">
            <label htmlFor="curation_prompt">Curation Instructions *</label>
            <textarea
              id="curation_prompt"
              name="curation_prompt"
              required
              rows={4}
              placeholder="How should the agent summarize and explain the articles..."
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical'
              }}
              defaultValue={`選定された記事をもとに、以下の形式でキュレーション記事を作成してください：
- 分かりやすいタイトル
- 記事の要点をまとめた導入
- 各記事の重要なポイントの解説
- 読者への示唆や考察`}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="llm_provider">LLM Provider</label>
              <select id="llm_provider" name="llm_provider" defaultValue="google">
                <option value="google">Google (Gemini)</option>
                <option value="anthropic">Anthropic</option>
                <option value="openai">OpenAI</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="llm_model">Model</label>
              <input
                type="text"
                id="llm_model"
                name="llm_model"
                defaultValue="gemini-3-pro-preview"
              />
            </div>

            <div className="form-group">
              <label htmlFor="run_frequency">Frequency</label>
              <select id="run_frequency" name="run_frequency" defaultValue="daily">
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            className="button" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={isPending}
          >
            {isPending ? 'Creating...' : 'Create Agent'}
          </button>
        </form>
      </div>
    </div>
  )
}
