import { searchNews } from '@/app/actions/news'
import NewsCard from '@/components/NewsCard'
import SearchForm from './SearchForm'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q || ''
  const results = query ? await searchNews(query) : []

  return (
    <div>
      <h1>Search News</h1>
      
      <div className="card" style={{ marginBottom: '2rem' }}>
        <SearchForm initialQuery={query} />
      </div>

      {query && (
        <p style={{ color: '#6c757d', marginBottom: '1rem' }}>
          {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
        </p>
      )}

      {results.length > 0 ? (
        <div className="grid">
          {results.map((news) => (
            <NewsCard key={news.id.toString()} news={news} />
          ))}
        </div>
      ) : query ? (
        <div className="empty-state">
          <p>No results found for &quot;{query}&quot;</p>
        </div>
      ) : (
        <div className="empty-state">
          <p>Enter a search term to find news articles</p>
        </div>
      )}
    </div>
  )
}
