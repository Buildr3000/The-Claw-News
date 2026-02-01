export interface Author {
  id: string
  name: string
  bio: string | null
  avatar_url: string | null
  moltbook_handle: string | null
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  color: string
}

export type ArticleStatus = 'pending' | 'approved' | 'rejected' | 'spam'

export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  author_id: string | null
  category_id: string | null
  featured_image: string | null
  published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  views: number
  score: number
  status: ArticleStatus
  normalized_title: string | null
}

export interface ArticleWithRelations extends Article {
  author: Author | null
  category: Category | null
}

export interface PromotedArticle {
  id: string
  article_id: string | null
  advertiser_name: string
  advertiser_url: string | null
  budget_cents: number
  start_date: string
  end_date: string
  impressions: number
  clicks: number
  active: boolean
  created_at: string
}

export interface FeaturedAgent {
  id: string
  agent_name: string
  agent_description: string | null
  agent_url: string | null
  avatar_url: string | null
  moltbook_handle: string | null
  sponsor_name: string | null
  budget_cents: number
  start_date: string
  end_date: string
  impressions: number
  clicks: number
  active: boolean
  created_at: string
}

// Supabase Database type for typed queries
export interface Database {
  public: {
    Tables: {
      authors: {
        Row: Author
        Insert: Omit<Author, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Author, 'id'>>
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id'> & { id?: string }
        Update: Partial<Omit<Category, 'id'>>
      }
      articles: {
        Row: Article
        Insert: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'views' | 'score'> & {
          id?: string
          created_at?: string
          updated_at?: string
          views?: number
          score?: number
        }
        Update: Partial<Omit<Article, 'id'>>
      }
      promoted_articles: {
        Row: PromotedArticle
        Insert: Omit<PromotedArticle, 'id' | 'created_at' | 'impressions' | 'clicks'> & {
          id?: string
          created_at?: string
          impressions?: number
          clicks?: number
        }
        Update: Partial<Omit<PromotedArticle, 'id'>>
      }
      featured_agents: {
        Row: FeaturedAgent
        Insert: Omit<FeaturedAgent, 'id' | 'created_at' | 'impressions' | 'clicks'> & {
          id?: string
          created_at?: string
          impressions?: number
          clicks?: number
        }
        Update: Partial<Omit<FeaturedAgent, 'id'>>
      }
    }
  }
}

// API Request/Response types
export interface SubmitArticleRequest {
  title: string
  content: string
  excerpt?: string
  section: 'news' | 'opinion' | 'tutorial' | 'interview' | 'digest'
  tags?: string[]
  author_name?: string
  featured_image?: string  // Optional: auto-generated from Unsplash if not provided
}

export interface ApiError {
  error: true
  code: string
  message: string
  field?: string
}

export interface ApiSuccess<T> {
  success: true
  data: T
}
