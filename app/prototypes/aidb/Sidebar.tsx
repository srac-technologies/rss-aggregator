'use client'

import Link from 'next/link'
import { useState } from 'react'
import styles from './aidb.module.css'
import type { NewsItem } from '@/app/actions/news'

type Tag = {
  id: number
  tag: string | null
}

type Props = {
  tags: Tag[]
  news: NewsItem[]
}

export default function Sidebar({ tags, news }: Props) {
  const [activePopularTab, setActivePopularTab] = useState<'week' | 'month'>('week')

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
  }

  return (
    <aside className={styles.sidebar}>
      {/* お知らせ */}
      <section className={styles.sidebarSection}>
        <h3 className={styles.sidebarTitle}>お知らせ</h3>
        <ul className={styles.sidebarList}>
          <li className={styles.sidebarListItem}>
            <div className={styles.sidebarDate}>2026.01.29</div>
            <Link href="#">新機能のお知らせ</Link>
          </li>
          <li className={styles.sidebarListItem}>
            <div className={styles.sidebarDate}>2026.01.28</div>
            <Link href="#">メンテナンス完了のお知らせ</Link>
          </li>
        </ul>
      </section>

      {/* 人気記事 */}
      <section className={styles.sidebarSection}>
        <div className={styles.popularTabs}>
          <button 
            className={`${styles.popularTab} ${activePopularTab === 'week' ? styles.popularTabActive : ''}`}
            onClick={() => setActivePopularTab('week')}
          >
            今週の人気記事
          </button>
          <button 
            className={`${styles.popularTab} ${activePopularTab === 'month' ? styles.popularTabActive : ''}`}
            onClick={() => setActivePopularTab('month')}
          >
            今月の人気記事
          </button>
        </div>
        <div className={styles.popularList}>
          {news.map((item, index) => (
            <Link key={item.id.toString()} href={`/news/${item.id}`} className={styles.popularItem}>
              <span className={styles.popularRank}>{index + 1}</span>
              <span className={styles.popularTitle}>{item.title || 'Untitled'}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* タグ */}
      <section className={styles.sidebarSection}>
        <h3 className={styles.sidebarTitle}>技術キーワード</h3>
        <div className={styles.tagCloud}>
          {tags.slice(0, 10).map((tag) => (
            <Link key={tag.id} href={`/tags`} className={styles.tagItem}>
              {tag.tag}
              <span className={styles.tagCount}>{Math.floor(Math.random() * 50) + 1}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* カテゴリ */}
      <section className={styles.sidebarSection}>
        <h3 className={styles.sidebarTitle}>記事カテゴリー</h3>
        <ul className={styles.sidebarList}>
          <li className={styles.sidebarListItem}>
            <Link href="#">深堀り解説 <span style={{ color: '#999' }}>68</span></Link>
          </li>
          <li className={styles.sidebarListItem}>
            <Link href="#">注目論文まとめ <span style={{ color: '#999' }}>26</span></Link>
          </li>
          <li className={styles.sidebarListItem}>
            <Link href="#">AI短信 <span style={{ color: '#999' }}>124</span></Link>
          </li>
        </ul>
      </section>
    </aside>
  )
}
