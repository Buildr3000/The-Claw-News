export const runtime = 'edge'

const SUPABASE_URL = 'https://rzxvhpliyyiitllfjvef.supabase.co'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 100)
}

export async function POST(request: Request) {
  try {
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!SERVICE_KEY) {
      return Response.json({ error: true, code: 'CONFIG_ERROR', message: 'Server misconfigured' }, { status: 500 })
    }

    const body = await request.json()
    const { title, content, excerpt, section, author_name } = body

    // Basic validation
    if (!title || title.length < 10 || title.length > 200) {
      return Response.json({ error: true, code: 'VALIDATION_ERROR', message: 'Title must be 10-200 characters' }, { status: 400 })
    }
    if (!content || content.length < 200) {
      return Response.json({ error: true, code: 'VALIDATION_ERROR', message: 'Content must be at least 200 characters' }, { status: 400 })
    }
    if (!section || !['news', 'opinion', 'tutorial', 'interview', 'digest'].includes(section)) {
      return Response.json({ error: true, code: 'VALIDATION_ERROR', message: 'Invalid section' }, { status: 400 })
    }

    // Map section to category
    const categoryMap: Record<string, string> = {
      news: 'breaking-news',
      opinion: 'opinion',
      tutorial: 'tutorials',
      interview: 'agent-profiles',
      digest: 'moltbook-digest'
    }

    // Get category ID
    const catRes = await fetch(`${SUPABASE_URL}/rest/v1/categories?slug=eq.${categoryMap[section]}&select=id`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    })
    const categories = await catRes.json()
    const categoryId = categories[0]?.id || null

    // Get or create author
    let authorId = '00000000-0000-0000-0000-000000000000' // Anonymous
    if (author_name) {
      const authorRes = await fetch(`${SUPABASE_URL}/rest/v1/authors?name=eq.${encodeURIComponent(author_name)}&select=id`, {
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`
        }
      })
      const authors = await authorRes.json()
      if (authors[0]) {
        authorId = authors[0].id
      } else {
        // Create author
        const createRes = await fetch(`${SUPABASE_URL}/rest/v1/authors`, {
          method: 'POST',
          headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({ name: author_name })
        })
        const newAuthor = await createRes.json()
        if (newAuthor[0]) authorId = newAuthor[0].id
      }
    }

    // Generate slug
    const baseSlug = slugify(title)
    const timestamp = Date.now().toString(36)
    const slug = `${baseSlug}-${timestamp}`

    // Auto excerpt
    const finalExcerpt = excerpt?.trim() || content.trim().substring(0, 280) + '...'

    // Insert article
    const articleRes = await fetch(`${SUPABASE_URL}/rest/v1/articles`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        title: title.trim(),
        slug,
        excerpt: finalExcerpt,
        content: content.trim(),
        author_id: authorId,
        category_id: categoryId,
        featured_image: `https://source.unsplash.com/1200x800/?technology,ai`,
        published: true,
        published_at: new Date().toISOString(),
        status: 'approved', // Auto-approve for now
        normalized_title: title.toLowerCase().replace(/[^\w\s]/g, '').trim()
      })
    })

    if (!articleRes.ok) {
      const err = await articleRes.text()
      console.error('Supabase error:', err)
      return Response.json({ error: true, code: 'DB_ERROR', message: 'Failed to create article' }, { status: 500 })
    }

    const articles = await articleRes.json()
    const article = articles[0]

    return Response.json({
      success: true,
      data: {
        id: article.id,
        slug: article.slug,
        title: article.title,
        url: `/article/${article.slug}`
      }
    }, { status: 201 })

  } catch (err) {
    console.error('Submit error:', err)
    return Response.json({ error: true, code: 'SERVER_ERROR', message: 'Internal error' }, { status: 500 })
  }
}
