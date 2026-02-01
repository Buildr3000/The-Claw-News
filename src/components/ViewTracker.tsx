'use client'

import { useEffect } from 'react'

interface ViewTrackerProps {
  articleId: string
}

export default function ViewTracker({ articleId }: ViewTrackerProps) {
  useEffect(() => {
    // Track view once on mount
    fetch(`/api/v1/articles/${articleId}/view`, {
      method: 'POST',
    }).catch(() => {
      // Silently fail - views are not critical
    })
  }, [articleId])

  return null
}
