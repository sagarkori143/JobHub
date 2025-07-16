"use client"

import { useEffect, useRef } from "react"

export function useVisitTracking() {
  const hasTracked = useRef(false)

  useEffect(() => {
    if (hasTracked.current) return

    // Don't track visits on localhost (development environment)
    if (typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('localhost') ||
      window.location.hostname.includes('127.0.0.1') ||
      window.location.port === '3000' ||
      window.location.port === '3001'
    )) {
      hasTracked.current = true
      return
    }

    // Check if we've already tracked a visit in localStorage
    const hasIncremented = localStorage.getItem('jobhub_visit_incremented')
    if (hasIncremented === 'true') {
      hasTracked.current = true
      return
    }

    fetch("/api/visit-increment", { method: "POST" })
      .then(res => res.json())
      .then(data => {
        // Mark as incremented in localStorage
        localStorage.setItem('jobhub_visit_incremented', 'true')
        hasTracked.current = true
      })
      .catch(err => {
        // Silent error handling
      })
  }, [])

  return {
    hasTracked: hasTracked.current
  }
} 