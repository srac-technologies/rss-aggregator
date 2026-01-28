'use client'

import { useState, useTransition } from 'react'
import { getNewsBySubscription, type NewsItem } from '@/app/actions/news'
import NewsCard from '@/components/NewsCard'

const PAGE_SIZE = 10

type Props = {
  subscriptionId: string
  initialNews: NewsItem[]
}

export default function NewsList({ subscriptionId, initialNews }: Props) {
  const [news, setNews] = useState<NewsItem[]>(initialNews)
  const [hasMore, setHasMore] = useState(initialNews.length === PAGE_SIZE)
  const [isPending, startTransition] = useTransition()

  const loadMore = () => {
    startTransition(async () => {
      const moreNews = await getNewsBySubscription(subscriptionId, PAGE_SIZE, news.length)
      if (moreNews.length < PAGE_SIZE) {
        setHasMore(false)
      }
      setNews(prev => [...prev, ...moreNews])
    })
  }

  if (news.length === 0) {
    return (
      <div className="card">
        <p style={{ color: '#6c757d' }}>No news items found for this subscription.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid">
        {news.map((item) => (
          <NewsCard key={item.id.toString()} news={item} />
        ))}
      </div>
      
      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button 
            className="button" 
            onClick={loadMore}
            disabled={isPending}
          >
            {isPending ? '読み込み中...' : 'もっと見る'}
          </button>
        </div>
      )}
    </div>
  )
}
