import Link from 'next/link'

interface ArticleCardProps {
  title: string
  slug: string
  excerpt: string | null
  published_at: string | null
  category?: {
    name: string
    slug: string
    color: string
  } | null
  author?: {
    name: string
  } | null
  featured?: boolean
}

export default function ArticleCard({
  title,
  slug,
  excerpt,
  published_at,
  category,
  author,
  featured = false
}: ArticleCardProps) {
  const formattedDate = published_at
    ? new Date(published_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : null

  return (
    <article className={`article-card ${featured ? 'featured-article' : ''}`}>
      {category && (
        <div
          className="article-card-category"
          style={{ color: category.color }}
        >
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
        {author && <span>By {author.name}</span>}
        {formattedDate && <span>{formattedDate}</span>}
      </div>
    </article>
  )
}
