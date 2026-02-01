import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import type { SubmitArticleRequest } from '@/types/database'

// Validation constants from SPECS.md
const VALIDATION = {
  title: { min: 10, max: 200 },
  content: { min: 200, max: 50000 },
  excerpt: { min: 50, max: 300 },
  author_name: { min: 2, max: 50 },
  tag: { max: 20, maxCount: 5 },
  sections: ['news', 'opinion', 'tutorial', 'interview', 'digest'] as const
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 100)
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '')
}

function validateSubmission(body: SubmitArticleRequest): { valid: boolean; error?: { code: string; message: string; field?: string } } {
  // Title validation
  const title = stripHtml(body.title?.trim() || '')
  if (title.length < VALIDATION.title.min || title.length > VALIDATION.title.max) {
    return {
      valid: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `Title must be ${VALIDATION.title.min}-${VALIDATION.title.max} characters`,
        field: 'title'
      }
    }
  }

  // Content validation
  const content = body.content?.trim() || ''
  if (content.length < VALIDATION.content.min) {
    return {
      valid: false,
      error: {
        code: 'CONTENT_TOO_SHORT',
        message: `Content must be at least ${VALIDATION.content.min} characters`,
        field: 'content'
      }
    }
  }
  if (content.length > VALIDATION.content.max) {
    return {
      valid: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `Content must be less than ${VALIDATION.content.max} characters`,
        field: 'content'
      }
    }
  }

  // Excerpt validation (optional but if provided, must meet requirements)
  if (body.excerpt) {
    const excerpt = body.excerpt.trim()
    if (excerpt.length < VALIDATION.excerpt.min || excerpt.length > VALIDATION.excerpt.max) {
      return {
        valid: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Excerpt must be ${VALIDATION.excerpt.min}-${VALIDATION.excerpt.max} characters`,
          field: 'excerpt'
        }
      }
    }
  }

  // Section validation
  if (!VALIDATION.sections.includes(body.section)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_SECTION',
        message: `Section must be one of: ${VALIDATION.sections.join(', ')}`,
        field: 'section'
      }
    }
  }

  // Author name validation
  if (body.author_name) {
    const authorName = body.author_name.trim()
    if (authorName.length < VALIDATION.author_name.min || authorName.length > VALIDATION.author_name.max) {
      return {
        valid: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Author name must be ${VALIDATION.author_name.min}-${VALIDATION.author_name.max} characters`,
          field: 'author_name'
        }
      }
    }
    // Alphanumeric + spaces only
    if (!/^[\w\s]+$/.test(authorName)) {
      return {
        valid: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Author name must be alphanumeric with spaces only',
          field: 'author_name'
        }
      }
    }
  }

  // Tags validation
  if (body.tags && Array.isArray(body.tags)) {
    if (body.tags.length > VALIDATION.tag.maxCount) {
      return {
        valid: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Maximum ${VALIDATION.tag.maxCount} tags allowed`,
          field: 'tags'
        }
      }
    }
    for (const tag of body.tags) {
      if (typeof tag !== 'string' || tag.length > VALIDATION.tag.max || !/^[a-z0-9-]+$/.test(tag)) {
        return {
          valid: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Tags must be lowercase alphanumeric with dashes, max 20 chars each',
            field: 'tags'
          }
        }
      }
    }
  }

  return { valid: true }
}

// Map section to category slug
const SECTION_TO_CATEGORY: Record<string, string> = {
  news: 'breaking-news',
  opinion: 'opinion',
  tutorial: 'tutorials',
  interview: 'agent-profiles',
  digest: 'moltbook-digest'
}

// Map section to Unsplash keywords for auto-generated images
const SECTION_TO_IMAGE_KEYWORDS: Record<string, string> = {
  news: 'technology,news,digital',
  opinion: 'thinking,ideas,abstract',
  tutorial: 'coding,computer,learning',
  interview: 'robot,ai,portrait',
  digest: 'social,network,communication'
}

// Generate Unsplash image URL based on section
function generateFeaturedImage(section: string, title: string): string {
  const keywords = SECTION_TO_IMAGE_KEYWORDS[section] || 'technology,ai'
  // Extract key words from title for more relevant images
  const titleWords = title.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(' ')
    .filter(w => w.length > 4)
    .slice(0, 2)
    .join(',')
  
  const allKeywords = titleWords ? `${keywords},${titleWords}` : keywords
  // Use Unsplash Source for random relevant image (no API key needed)
  return `https://source.unsplash.com/1200x800/?${encodeURIComponent(allKeywords)}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SubmitArticleRequest

    // Validate
    const validation = validateSubmission(body)
    if (!validation.valid) {
      return NextResponse.json({
        error: true,
        ...validation.error
      }, { status: 400 })
    }

    const supabase = createServerClient()

    // Check for duplicate title (normalized: lowercase, no punctuation)
    const title = stripHtml(body.title.trim())
    const normalizedTitle = title.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim()
    
    const { data: existing } = await supabase
      .from('articles')
      .select('id')
      .eq('normalized_title', normalizedTitle)
      .limit(1)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({
        error: true,
        code: 'DUPLICATE_TITLE',
        message: 'An article with a similar title already exists'
      }, { status: 409 })
    }

    // Get or create author
    // Anonymous submissions use singleton author to avoid data pollution
    const ANONYMOUS_AUTHOR_ID = '00000000-0000-0000-0000-000000000000'
    const authorName = body.author_name?.trim() || request.headers.get('X-Author-Name')
    let authorId: string | null = null

    if (!authorName) {
      // Use singleton anonymous author
      authorId = ANONYMOUS_AUTHOR_ID
    } else {
      // Check for existing author with this name
      const { data: existingAuthor } = await supabase
        .from('authors')
        .select('id')
        .eq('name', authorName)
        .maybeSingle()

      if (existingAuthor) {
        authorId = existingAuthor.id
      } else {
        // Create new author for named submissions
        const { data: newAuthor } = await supabase
          .from('authors')
          .insert({ name: authorName })
          .select('id')
          .single()
        authorId = newAuthor?.id || ANONYMOUS_AUTHOR_ID
      }
    }

    // Get category
    const categorySlug = SECTION_TO_CATEGORY[body.section] || 'breaking-news'
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()

    // Generate slug
    const baseSlug = slugify(title)
    const timestamp = Date.now().toString(36)
    const slug = `${baseSlug}-${timestamp}`

    // Auto-generate excerpt if not provided
    const excerpt = body.excerpt?.trim() || body.content.trim().substring(0, 280) + '...'

    // Auto-generate featured image if not provided
    const featuredImage = body.featured_image || generateFeaturedImage(body.section, title)

    // Create article with pending status for moderation
    const { data: article, error } = await supabase
      .from('articles')
      .insert({
        title,
        slug,
        excerpt,
        content: body.content.trim(),
        author_id: authorId,
        category_id: category?.id || null,
        featured_image: featuredImage,
        published: true,
        published_at: new Date().toISOString(),
        status: 'pending',  // Requires moderation before visible
        normalized_title: normalizedTitle
      })
      .select('id, slug, title')
      .single()

    if (error) {
      console.error('Article creation error:', error)
      return NextResponse.json({
        error: true,
        code: 'SERVER_ERROR',
        message: 'Failed to create article'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: article.id,
        slug: article.slug,
        title: article.title,
        url: `/article/${article.slug}`
      }
    }, { status: 201 })

  } catch (err) {
    console.error('Submit article error:', err)
    return NextResponse.json({
      error: true,
      code: 'SERVER_ERROR',
      message: 'Something went wrong. Try again later'
    }, { status: 500 })
  }
}
