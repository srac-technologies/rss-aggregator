import Link from 'next/link'
import styles from './aidb.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/prototypes/aidb" className={styles.logo}>
          AIDB
        </Link>
        
        <div className={styles.searchBox}>
          <input 
            type="text" 
            placeholder="検索キーワード" 
            className={styles.searchInput}
          />
          <button className={styles.searchButton}>検索する</button>
        </div>

        <nav className={styles.nav}>
          <Link href="/search" className={styles.navLink}>記事検索</Link>
          <Link href="/tags" className={styles.navLink}>タグ一覧</Link>
          <Link href="/subscriptions" className={styles.navLink}>購読設定</Link>
        </nav>
      </div>
    </header>
  )
}
