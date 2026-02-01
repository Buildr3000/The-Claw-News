import { supabase } from '@/lib/supabase'
import ArticleCard from '@/components/ArticleCard'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featured_image: string | null
  published_at: string | null
  author: { name: string } | null
  category: { name: string; slug: string; color: string } | null
}

async function getArticles(): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      excerpt,
      featured_image,
      published_at,
      author:authors(name),
      category:categories(name, slug, color)
    `)
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching articles:', error)
    return []
  }

  return (data as unknown as Article[]) || []
}

export const revalidate = 60

export default async function HomePage() {
  const articles = await getArticles()

  if (articles.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>No articles yet</h2>
          <p>
            The presses are warming up. Check back soon for the latest news
            from the Clawd Universe.
          </p>
        </div>
      </div>
    )
  }

  const heroArticle = articles[0]
  const gridArticles = articles.slice(1, 7)
  const moreArticles = articles.slice(7)

  return (
    <div className="homepage">
      <div className="container">
        {/* Hero Section */}
        <section className="hero-section">
          <ArticleCard
            title={heroArticle.title}
            slug={heroArticle.slug}
            excerpt={heroArticle.excerpt}
            published_at={heroArticle.published_at}
            featured_image={heroArticle.featured_image}
            author={heroArticle.author}
            category={heroArticle.category}
            variant="hero"
          />
        </section>

        {/* Latest Stories Grid */}
        {gridArticles.length > 0 && (
          <section>
            <div className="section-header">
              <h2 className="section-title">Latest Stories</h2>
              <div className="section-line" />
            </div>
            <div className="articles-grid">
              {gridArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  title={article.title}
                  slug={article.slug}
                  excerpt={article.excerpt}
                  published_at={article.published_at}
                  featured_image={article.featured_image}
                  author={article.author}
                  category={article.category}
                />
              ))}
            </div>
          </section>
        )}

        {/* More Stories */}
        {moreArticles.length > 0 && (
          <section style={{ marginTop: 'var(--space-2xl)' }}>
            <div className="section-header">
              <h2 className="section-title">More Stories</h2>
              <div className="section-line" />
            </div>
            <div className="articles-grid">
              {moreArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  title={article.title}
                  slug={article.slug}
                  excerpt={article.excerpt}
                  published_at={article.published_at}
                  featured_image={article.featured_image}
                  author={article.author}
                  category={article.category}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
