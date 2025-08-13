'use client'

import { deleteTag, updateTag } from '@/app/actions/tags'
import { useState } from 'react'

interface Tag {
  id: number
  tag: string
  created_at: string
}

export default function TagList({ tags }: { tags: Tag[] }) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')

  const doDeleteTag = async (id: number) => {
    await deleteTag(id)
  }

  function startEdit(tag: Tag) {
    setEditingId(tag.id)
    setEditValue(tag.tag)
  }

  async function handleUpdate() {
    if (editingId && editValue) {
      await updateTag(editingId, editValue)
      setEditingId(null)
      setEditValue('')
    }
  }

  function cancelEdit() {
    setEditingId(null)
    setEditValue('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {tags.map(tag => (
        <div
          key={tag.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.75rem',
            background: '#f8f9fa',
            borderRadius: '6px'
          }}
        >
          {editingId === tag.id ? (
            <>
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.25rem 0.5rem',
                  border: '1px solid #0070f3',
                  borderRadius: '4px'
                }}
                autoFocus
              />
              <button
                onClick={handleUpdate}
                className="button"
                style={{ padding: '0.25rem 0.75rem', fontSize: '13px' }}
              >
                Save
              </button>
              <button
                onClick={cancelEdit}
                className="button secondary"
                style={{ padding: '0.25rem 0.75rem', fontSize: '13px' }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <span style={{ flex: 1, fontWeight: 500 }}>{tag.tag}</span>
              <span style={{ color: '#6c757d', fontSize: '12px' }}>
                ID: {tag.id}
              </span>
              <button
                onClick={() => startEdit(tag)}
                className="button"
                style={{ padding: '0.25rem 0.75rem', fontSize: '13px' }}
              >
                Edit
              </button>
              <form action={() => doDeleteTag(tag.id)} style={{ margin: 0 }}>
                <button
                  type="submit"
                  className="button danger"
                  style={{ padding: '0.25rem 0.75rem', fontSize: '13px' }}
                  onClick={(e) => {
                    if (!confirm(`Delete tag "${tag.tag}"? This will remove it from all subscriptions and news.`)) {
                      e.preventDefault()
                    }
                  }}
                >
                  Delete
                </button>
              </form>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
