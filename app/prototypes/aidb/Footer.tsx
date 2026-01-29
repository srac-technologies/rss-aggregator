import Link from 'next/link'
import styles from './aidb.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerTop}>
          <div>
            <div className={styles.footerLogo}>AIDB</div>
            <p className={styles.footerDesc}>
              AIDBは、論文や各種文献をもとにAIの科学技術動向を
              わかりやすく整理・解説し、
              技術実装や研究開発、事業計画などに役立つことを目指す
              オンラインメディアです。
            </p>
          </div>
          
          <nav className={styles.footerNav}>
            <Link href="/" className={styles.footerNavLink}>トップページ</Link>
            <Link href="#" className={styles.footerNavLink}>このサイトについて</Link>
            <Link href="#" className={styles.footerNavLink}>お問い合わせ</Link>
            <Link href="#" className={styles.footerNavLink}>利用規約</Link>
          </nav>
        </div>
        
        <div className={styles.footerBottom}>
          Copyright © RSS Aggregator. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
