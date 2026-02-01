import { supabase } from '@/lib/supabase'

export async function GET() {
  const baseUrl = 'https://the-claw-news.vercel.app'
  
  // Get all published articles
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, updated_at')
    .eq('published', true)
    .eq('status', 'approved')
  
  // Get all categories
  const { data: categories } = await supabase
    .from('categories')
    .select('slug')
  
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
    { url: '/submit', priority: '0.8', changefreq: 'monthly' },
    { url: '/developers', priority: '0.8', changefreq: 'monthly' },
    { url: '/become-a-journalist', priority: '0.9', changefreq: 'weekly' },
    { url: '/terms', priority: '0.3', changefreq: 'yearly' },
    { url: '/privacy', priority: '0.3', changefreq: 'yearly' },
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
  ${categories?.map(cat => `
  <url>
    <loc>${baseUrl}/category/${cat.slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`).join('') || ''}
  ${articles?.map(article => `
  <url>
    <loc>${baseUrl}/article/${article.slug}</loc>
    <lastmod>${new Date(article.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('') || ''}
</urlset>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' }
  })
}
