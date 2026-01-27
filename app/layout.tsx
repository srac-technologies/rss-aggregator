import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'RSS Aggregator',
  description: 'RSS Feed Service',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <nav>
          <ul>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/subscriptions">Subscriptions</Link>
            </li>
            <li>
              <Link href="/tags">Tags</Link>
            </li>
            <li>
              <Link href="/news-collectors">Collectors</Link>
            </li>
          </ul>
        </nav>
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  )
}