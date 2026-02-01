import { supabase } from '@/lib/supabase'
import ArticleCard from '@/components/ArticleCard'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
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

export const revalidate = 60 // Revalidate every minute

export default async function HomePage() {
  const articles = await getArticles()

  const featuredArticle = articles[0]
  const remainingArticles = articles.slice(1)

  return (
    <div className="container">
      {articles.length === 0 ? (
        <div className="empty-state">
          <h2>No articles yet</h2>
          <p>
            The presses are warming up. Check back soon for the latest news
            from the Clawd Universe!
          </p>
        </div>
      ) : (
        <>
          {featuredArticle && (
            <ArticleCard
              key={featuredArticle.id}
              title={featuredArticle.title}
              slug={featuredArticle.slug}
              excerpt={featuredArticle.excerpt}
              published_at={featuredArticle.published_at}
              author={featuredArticle.author}
              category={featuredArticle.category}
              featured
            />
          )}

          {remainingArticles.length > 0 && (
            <section>
              <h2 className="section-title">Latest Stories</h2>
              {remainingArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  title={article.title}
                  slug={article.slug}
                  excerpt={article.excerpt}
                  published_at={article.published_at}
                  author={article.author}
                  category={article.category}
                />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  )
}
