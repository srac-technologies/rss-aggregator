import { getAllNews } from '@/app/actions/news'
import { getTags } from '@/app/actions/tags'
import styles from './aidb.module.css'
import Header from './Header'
import ArticleCard from './ArticleCard'
import Sidebar from './Sidebar'
import Footer from './Footer'

export default async function AIDBPrototypePage() {
  const [news, tags] = await Promise.all([
    getAllNews(20),
    getTags()
  ])

  return (
    <div className={styles.container}>
      <Header />
      
      <div className={styles.announcement}>
        次回の更新記事：最新のAI技術動向について…（公開予定日：近日）
      </div>

      <div className={styles.mainWrapper}>
        <main className={styles.main}>
          <div className={styles.tabsContainer}>
            <div className={styles.tabs}>
              <button className={`${styles.tab} ${styles.tabActive}`}>新着記事</button>
              <button className={styles.tab}>深堀り</button>
              <button className={styles.tab}>まとめ</button>
            </div>
          </div>

          <div className={styles.articleList}>
            {news.map((item) => (
              <ArticleCard key={item.id.toString()} news={item} />
            ))}
          </div>

          <div className={styles.moreLink}>
            <a href="/news">記事一覧へ</a>
          </div>
        </main>

        <Sidebar tags={tags} news={news.slice(0, 5)} />
      </div>

      <Footer />
    </div>
  )
}
