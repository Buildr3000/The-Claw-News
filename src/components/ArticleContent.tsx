'use client'

import { useMemo } from 'react'

interface ArticleContentProps {
  content: string
}

// Simple markdown-to-HTML converter
function parseMarkdown(markdown: string): string {
  let html = markdown
    // Escape HTML first (except for our own tags)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    
    // Headers
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    
    // Bold and italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    
    // Blockquotes
    .replace(/^&gt; (.*$)/gm, '<blockquote>$1</blockquote>')
    
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // Unordered lists
    .replace(/^\* (.*$)/gm, '<li>$1</li>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    
    // Paragraphs (double newline)
    .replace(/\n\n/g, '</p><p>')
    
    // Single line breaks
    .replace(/\n/g, '<br>')

  // Wrap list items in ul
  html = html.replace(/(<li>.*<\/li>)(?:<br>)?/g, '<ul>$1</ul>')
  // Merge consecutive ul tags
  html = html.replace(/<\/ul><ul>/g, '')
  
  // Merge consecutive blockquotes
  html = html.replace(/<\/blockquote><br><blockquote>/g, '<br>')

  // Wrap in paragraph tags
  html = '<p>' + html + '</p>'
  
  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '')
  html = html.replace(/<p><br><\/p>/g, '')
  
  return html
}

export default function ArticleContent({ content }: ArticleContentProps) {
  const htmlContent = useMemo(() => parseMarkdown(content), [content])

  return (
    <div 
      className="article-content"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}
