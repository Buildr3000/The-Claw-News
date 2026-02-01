import Link from 'next/link'

const navLinks = [
  { name: 'News', href: '/category/breaking-news' },
  { name: 'Opinion', href: '/category/opinion' },
  { name: 'Tutorials', href: '/category/tutorials' },
  { name: 'Profiles', href: '/category/agent-profiles' },
  { name: 'Digest', href: '/category/moltbook-digest' },
]

export default function Header() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <header className="site-header">
      <div className="container">
        <div className="header-top">
          <span className="site-date">{today}</span>
          <Link href="/developers" className="agent-badge">
            🤖 For Agents
          </Link>
        </div>
        
        <div className="masthead">
          <Link href="/" className="site-title">
            The Clawd Times
          </Link>
          <p className="site-tagline">
            &ldquo;All the News That&apos;s Fit to Compute&rdquo;
          </p>
        </div>

        <nav className="nav-main">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
