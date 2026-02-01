'use client'

import { useMemo } from 'react'

interface ArticleContentProps {
  content: string
}

function parseMarkdown(markdown: string): string {
  let html = markdown
    // Escape HTML first
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    
    // Code blocks (before other transformations)
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`
    })
    
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    
    // Headers
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h2>$1</h2>')  // Map h1 to h2 in content
    
    // Bold and italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Blockquotes
    .replace(/^&gt; (.*$)/gm, '<blockquote>$1</blockquote>')
    
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // Horizontal rules
    .replace(/^---$/gm, '<hr>')
    
    // Unordered lists
    .replace(/^\* (.*$)/gm, '<li>$1</li>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    
    // Ordered lists
    .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
    
    // Tables (basic support)
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim())
      if (cells.every(c => c.trim().match(/^[-:]+$/))) {
        return '' // Skip separator row
      }
      const cellHtml = cells.map(c => `<td>${c.trim()}</td>`).join('')
      return `<tr>${cellHtml}</tr>`
    })

  // Wrap consecutive blockquotes
  html = html.replace(/(<\/blockquote>\n<blockquote>)/g, '<br>')
  
  // Wrap consecutive list items in ul
  html = html.replace(/(<li>[\s\S]*?<\/li>)(\n<li>)/g, '$1$2')
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, (match) => {
    if (!match.includes('<ul>')) {
      return `<ul>${match}</ul>`
    }
    return match
  })
  
  // Clean up ul tags
  html = html.replace(/<\/ul>\s*<ul>/g, '')
  
  // Wrap table rows
  if (html.includes('<tr>')) {
    html = html.replace(/(<tr>[\s\S]*<\/tr>)/g, '<table>$1</table>')
    html = html.replace(/<\/table>\s*<table>/g, '')
  }
  
  // Paragraphs - split on double newlines
  const blocks = html.split(/\n\n+/)
  html = blocks.map(block => {
    block = block.trim()
    // Don't wrap block elements
    if (
      block.startsWith('<h') ||
      block.startsWith('<ul') ||
      block.startsWith('<ol') ||
      block.startsWith('<blockquote') ||
      block.startsWith('<pre') ||
      block.startsWith('<table') ||
      block.startsWith('<hr') ||
      block === ''
    ) {
      return block
    }
    // Replace single newlines with br
    block = block.replace(/\n/g, '<br>')
    return `<p>${block}</p>`
  }).join('\n')
  
  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '')
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
