/**
 * Add featured images to existing articles
 * Run: SUPABASE_SERVICE_ROLE_KEY=xxx npx ts-node --esm scripts/add-images.ts
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rzxvhpliyyiitllfjvef.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required')
  process.exit(1)
}

const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
}

// Map slug keywords to relevant Unsplash images
const imageByKeyword: Array<[string[], string]> = [
  [['welcome', 'openclaw-times'], 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=630&fit=crop'], // newspaper
  [['compound', 'loop', 'learn', 'sleep'], 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=630&fit=crop'], // automation/circuits
  [['moltbook', 'rise', '32000'], 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&h=630&fit=crop'], // social network
  [['submit', 'articles', 'how-to'], 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&h=630&fit=crop'], // writing/laptop
  [['media', 'opinion', 'need'], 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&h=630&fit=crop'], // news media
  [['nanoclaw', 'minimalism', 'minimalist'], 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=630&fit=crop'], // minimalist tech
  [['google', 'research'], 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=1200&h=630&fit=crop'], // Google/research
  [['philosophize', 'discourse', 'deep'], 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1200&h=630&fit=crop'], // thinking/philosophy
  [['moltreg', 'economy', 'bridge'], 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=630&fit=crop'], // blockchain/economy
  [['release', 'update', 'version'], 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=630&fit=crop'], // code/release
  [['hacker', 'news'], 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=630&fit=crop'], // hacker aesthetic
]

function getImageForSlug(slug: string): string {
  const slugLower = slug.toLowerCase()
  for (const [keywords, image] of imageByKeyword) {
    if (keywords.some(kw => slugLower.includes(kw))) {
      return image
    }
  }
  // Fallback: AI brain
  return 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&h=630&fit=crop'
}

async function addImages() {
  console.log('🖼️  Adding relevant images to The Clawd Times articles...\n')

  // Get all articles
  const res = await fetch(`${SUPABASE_URL}/rest/v1/articles?select=id,slug,title,featured_image`, { headers })
  if (!res.ok) {
    console.error('Failed to fetch articles:', await res.text())
    process.exit(1)
  }
  
  const articles = await res.json()
  console.log(`Found ${articles.length} articles\n`)

  let updated = 0
  for (const article of articles) {
    const image = getImageForSlug(article.slug)
    
    const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/articles?id=eq.${article.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ featured_image: image })
    })
    
    if (updateRes.ok) {
      updated++
      console.log(`✓ ${article.title}`)
      console.log(`  → ${image.split('?')[0].split('/').pop()}`)
    } else {
      console.error(`✗ Failed: ${article.title}`, await updateRes.text())
    }
  }

  console.log(`\n✨ Done! Updated ${updated} articles with images.`)
}

addImages().catch(console.error)
