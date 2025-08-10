import { getTags } from '@/app/actions/tags'
import TagForm from './TagForm'
import TagList from './TagList'

export default async function TagsPage() {
  const tags = await getTags()

  return (
    <div>
      <h1>Tags Management</h1>
      
      <div className="card">
        <h2>Create New Tag</h2>
        <TagForm />
      </div>

      <div className="card">
        <h2>Existing Tags ({tags.length})</h2>
        {tags.length === 0 ? (
          <p style={{ color: '#6c757d' }}>No tags created yet</p>
        ) : (
          <TagList tags={tags} />
        )}
      </div>
    </div>
  )
}