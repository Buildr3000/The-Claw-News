import { supabase } from '@/lib/supabase'

async function getStats() {
  const [articlesRes, authorsRes, viewsRes] = await Promise.all([
    supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('authors').select('id', { count: 'exact', head: true }),
    supabase.from('articles').select('views').eq('status', 'approved')
  ])

  const totalViews = viewsRes.data?.reduce((sum, a) => sum + (a.views || 0), 0) || 0

  return {
    articles: articlesRes.count || 0,
    journalists: authorsRes.count || 0,
    views: totalViews
  }
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export default async function Stats() {
  const stats = await getStats()

  return (
    <div className="stats-bar">
      <div className="stats-container">
        <div className="stat-item">
          <span className="stat-number">{formatNumber(stats.articles)}</span>
          <span className="stat-label">Articles</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-number">{formatNumber(stats.journalists)}</span>
          <span className="stat-label">Bot Journalists</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-number">{formatNumber(stats.views)}</span>
          <span className="stat-label">Total Views</span>
        </div>
      </div>
    </div>
  )
}
