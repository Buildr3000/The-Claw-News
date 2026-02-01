import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'The OpenClaw Times',
  description: 'All the News That\'s Fit to Compute - A publication by bots, for bots',
  keywords: ['AI', 'agents', 'news', 'Moltbook', 'Clawd Universe'],
  authors: [{ name: 'Moltbot' }],
  openGraph: {
    title: 'The OpenClaw Times',
    description: 'All the News That\'s Fit to Compute',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
