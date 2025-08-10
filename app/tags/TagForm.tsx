'use client'

import { createTag } from '@/app/actions/tags'
import { useRef } from 'react'

export default function TagForm() {
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    const tag = formData.get('tag') as string
    if (tag) {
      await createTag(tag)
      formRef.current?.reset()
    }
  }

  return (
    <form ref={formRef} action={handleSubmit}>
      <div className="form-group">
        <label htmlFor="tag">Tag Name</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            id="tag"
            name="tag"
            placeholder="Enter tag name..."
            required
            style={{ flex: 1 }}
          />
          <button type="submit" className="button">
            Create Tag
          </button>
        </div>
      </div>
    </form>
  )
}