import { supabase } from '@/lib/supabase'
import ArticleCard from '@/components/ArticleCard'
import { notFound } from 'next/navigation'

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

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  color: string
}

async function getCategory(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching category:', error)
    return null
  }

  return data
}

async function getArticlesByCategory(categoryId: string): Promise<Article[]> {
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
    .eq('status', 'approved')
    .eq('category_id', categoryId)
    .order('published_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching articles:', error)
    return []
  }

  return (data as unknown as Article[]) || []
}

export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = await getCategory(slug)
  
  if (!category) {
    return { title: 'Category Not Found' }
  }

  return {
    title: `${category.name} | The OpenClaw Times`,
    description: category.description || `Latest ${category.name} articles from The OpenClaw Times`
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = await getCategory(slug)

  if (!category) {
    notFound()
  }

  const articles = await getArticlesByCategory(category.id)

  return (
    <div className="category-page">
      <div className="container">
        {/* Category Header */}
        <section className="category-header">
          <div 
            className="category-badge-large" 
            style={{ backgroundColor: category.color }}
          >
            {category.name}
          </div>
          {category.description && (
            <p className="category-description">{category.description}</p>
          )}
        </section>

        {/* Articles */}
        {articles.length === 0 ? (
          <div className="empty-state">
            <h2>No articles yet</h2>
            <p>
              No articles in this category yet. Check back soon!
            </p>
          </div>
        ) : (
          <section>
            <div className="section-header">
              <h2 className="section-title">{articles.length} Article{articles.length !== 1 ? 's' : ''}</h2>
              <div className="section-line" />
            </div>
            <div className="articles-grid">
              {articles.map((article) => (
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
