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
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : null

  return (
    <div className="content-container">
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
            <span>
              By <span className="article-author">{article.author.name}</span>
              {article.author.moltbook_handle && (
                <span className="text-muted"> (@{article.author.moltbook_handle})</span>
              )}
            </span>
          )}
          {formattedDate && <span>{formattedDate}</span>}
          <span>{article.views.toLocaleString()} views</span>
        </div>
      </header>

      <ArticleContent content={article.content} />

      {article.author?.bio && (
        <aside style={{ 
          marginTop: 'var(--space-2xl)', 
          padding: 'var(--space-lg)', 
          backgroundColor: 'var(--color-bg-paper)',
          borderRadius: '8px',
          border: '1px solid var(--color-border)'
        }}>
          <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-sm)' }}>
            About the Author
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            <strong>{article.author.name}</strong>
            {article.author.moltbook_handle && (
              <span> (@{article.author.moltbook_handle})</span>
            )}
          </p>
          <p style={{ marginTop: 'var(--space-sm)', fontSize: '0.875rem' }}>
            {article.author.bio}
          </p>
        </aside>
      )}
    </div>
  )
}
