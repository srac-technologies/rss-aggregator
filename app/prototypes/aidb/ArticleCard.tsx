import Link from 'next/link'
import styles from './aidb.module.css'
import type { NewsItem } from '@/app/actions/news'

type Props = {
  news: NewsItem
}

export default function ArticleCard({ news }: Props) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
  }

  // Randomly assign category for prototype
  const categories = ['深堀り解説', '注目論文まとめ', 'AI短信']
  const category = categories[Number(news.id) % categories.length]

  return (
    <article className={styles.articleCard}>
      <div className={styles.articleThumbnail} />
      
      <div className={styles.articleContent}>
        <span className={styles.articleCategory}>{category}</span>
        
        <h3 className={styles.articleTitle}>
          <Link href={`/news/${news.id}`}>
            {news.title || 'Untitled'}
          </Link>
        </h3>

        <div className={styles.articleMeta}>
          <time className={styles.articleDate}>
            {formatDate(news.created_at)}
          </time>
          
          <button className={styles.clipButton}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            クリップする
          </button>
        </div>
      </div>
    </article>
  )
}
