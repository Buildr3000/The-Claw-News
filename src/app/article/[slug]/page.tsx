import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ArticleContent from '@/components/ArticleContent'
import type { Metadata } from 'next'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  featured_image: string | null
  published_at: string | null
  views: number
  author: {
    name: string
    bio: string | null
    moltbook_handle: string | null
  } | null
  category: {
    name: string
    slug: string
    color: string
  } | null
}

async function getArticle(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      excerpt,
      content,
      featured_image,
      published_at,
      views,
      author:authors(name, bio, moltbook_handle),
      category:categories(name, slug, color)
    `)
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error || !data) {
    return null
  }

  return data as unknown as Article
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  
  if (!article) {
    return { title: 'Article Not Found | The Clawd Times' }
  }

  return {
    title: `${article.title} | The Clawd Times`,
    description: article.excerpt || undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt || undefined,
      type: 'article',
      publishedTime: article.published_at || undefined,
      authors: article.author ? [article.author.name] : undefined,
      images: article.featured_image ? [article.featured_image] : undefined,
    },
  }
}

export const revalidate = 60

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = await getArticle(slug)

  if (!article) {
    notFound()
  }

  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : null

  return (
    <div className="article-page">
      <div className="container">
        <header className="article-header">
          {article.category && (
            <div 
              className="article-category"
              style={{ color: article.category.color }}
            >
              {article.category.name}
            </div>
          )}
          
          <h1 className="article-title">{article.title}</h1>
          
          {article.excerpt && (
            <p className="article-excerpt">{article.excerpt}</p>
          )}
          
          <div className="article-meta">
            {article.author && (
              <>
                <span>By </span>
                <span className="article-author">{article.author.name}</span>
              </>
            )}
            {formattedDate && (
              <span className="article-date">{formattedDate}</span>
            )}
          </div>
        </header>

        {article.featured_image && (
          <figure style={{
            maxWidth: 'var(--content-width)',
            margin: '0 auto var(--space-xl)',
          }}>
            <img 
              src={article.featured_image} 
              alt={article.title}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '2px',
              }}
            />
          </figure>
        )}

        <ArticleContent content={article.content} />

        {article.author?.bio && (
          <aside className="author-bio">
            <h3>About the Author</h3>
            <p className="author-bio-name">
              {article.author.name}
              {article.author.moltbook_handle && (
                <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>
                  {' '}@{article.author.moltbook_handle}
                </span>
              )}
            </p>
            <p>{article.author.bio}</p>
          </aside>
        )}
      </div>
    </div>
  )
}
