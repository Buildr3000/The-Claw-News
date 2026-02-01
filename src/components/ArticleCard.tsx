import Link from 'next/link'

interface ArticleCardProps {
  title: string
  slug: string
  excerpt: string | null
  published_at: string | null
  featured_image?: string | null
  category?: {
    name: string
    slug: string
    color: string
  } | null
  author?: {
    name: string
  } | null
  variant?: 'default' | 'hero' | 'horizontal'
}

export default function ArticleCard({
  title,
  slug,
  excerpt,
  published_at,
  featured_image,
  category,
  author,
  variant = 'default'
}: ArticleCardProps) {
  const formattedDate = published_at
    ? new Date(published_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : null

  // Hero variant (large featured article)
  if (variant === 'hero') {
    return (
      <article className="hero-article">
        <div className="hero-image" style={{
          backgroundImage: featured_image ? `url(${featured_image})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }} />
        <div className="hero-content">
          {category && (
            <div className="hero-category" style={{ color: category.color }}>
              {category.name}
            </div>
          )}
          <h1 className="hero-title">
            <Link href={`/article/${slug}`}>{title}</Link>
          </h1>
          {excerpt && (
            <p className="hero-excerpt">{excerpt}</p>
          )}
          <div className="hero-meta">
            {author && (
              <span>By <span className="author">{author.name}</span></span>
            )}
            {formattedDate && author && <span> · </span>}
            {formattedDate && <span>{formattedDate}</span>}
          </div>
        </div>
      </article>
    )
  }

  // Horizontal variant (small sidebar style)
  if (variant === 'horizontal') {
    return (
      <article className="article-card-horizontal">
        <div className="article-card-image" style={{
          backgroundImage: featured_image ? `url(${featured_image})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }} />
        <div>
          <h3 className="article-card-title">
            <Link href={`/article/${slug}`}>{title}</Link>
          </h3>
          <div className="article-card-meta">
            {author && <span className="author">{author.name}</span>}
          </div>
        </div>
      </article>
    )
  }

  // Default card
  return (
    <article className="article-card">
      <div className="article-card-image" style={{
        backgroundImage: featured_image ? `url(${featured_image})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }} />
      {category && (
        <div className="article-card-category" style={{ color: category.color }}>
          {category.name}
        </div>
      )}
      <h2 className="article-card-title">
        <Link href={`/article/${slug}`}>{title}</Link>
      </h2>
      {excerpt && (
        <p className="article-card-excerpt">{excerpt}</p>
      )}
      <div className="article-card-meta">
        {author && <span className="author">{author.name}</span>}
        {formattedDate && author && <span> · </span>}
        {formattedDate && <span>{formattedDate}</span>}
      </div>
    </article>
  )
}
