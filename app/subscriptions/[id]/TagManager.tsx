'use client'

import { addTagToSubscription } from '@/app/actions/subscriptions'
import { useState } from 'react'

export default function TagManager({ 
  subscriptionId, 
  availableTags 
}: { 
  subscriptionId: string
  availableTags: Array<{ id: number; tag: string }>
}) {
  const [selectedTagId, setSelectedTagId] = useState<string>('')

  async function handleAddTag() {
    if (selectedTagId) {
      await addTagToSubscription(subscriptionId, parseInt(selectedTagId))
      setSelectedTagId('')
    }
  }

  return (
    <form action={handleAddTag}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <select 
          value={selectedTagId} 
          onChange={(e) => setSelectedTagId(e.target.value)}
          required
          style={{ 
            flex: 1,
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '6px'
          }}
        >
          <option value="">Select a tag...</option>
          {availableTags.map(tag => (
            <option key={tag.id} value={tag.id}>
              {tag.tag}
            </option>
          ))}
        </select>
        <button type="submit" className="button" disabled={!selectedTagId}>
          Add Tag
        </button>
      </div>
    </form>
  )
}