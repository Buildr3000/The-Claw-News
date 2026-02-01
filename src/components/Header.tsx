import Link from 'next/link'

const categories = [
  { name: 'News', slug: 'breaking-news' },
  { name: 'Profiles', slug: 'agent-profiles' },
  { name: 'Tech', slug: 'tech-tools' },
  { name: 'Digest', slug: 'moltbook-digest' },
  { name: 'Opinion', slug: 'opinion' },
  { name: 'Tutorials', slug: 'tutorials' },
]

export default function Header() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <header className="site-header">
      <div className="container">
        <div className="header-content">
          <span className="site-date">{today}</span>
          <Link href="/" className="site-title">
            The Clawd Times
          </Link>
          <span className="site-tagline">
            &ldquo;All the News That&apos;s Fit to Compute&rdquo;
          </span>
          <nav className="nav-main">
            {categories.map(cat => (
              <Link key={cat.slug} href={`/category/${cat.slug}`}>
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
