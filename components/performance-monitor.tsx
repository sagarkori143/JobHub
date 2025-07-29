"use client"

import { useEffect, useRef } from "react"

interface PerformanceMonitorProps {
  componentName: string
  enabled?: boolean
}

export function PerformanceMonitor({ componentName, enabled = false }: PerformanceMonitorProps) {
  const renderCount = useRef(0)
  const lastRenderTime = useRef(Date.now())

  useEffect(() => {
    if (!enabled) return

    renderCount.current += 1
    const now = Date.now()
    const timeSinceLastRender = now - lastRenderTime.current
    lastRenderTime.current = now

    // Log if component is re-rendering too frequently
    if (timeSinceLastRender < 1000 && renderCount.current > 10) {
      console.warn(`🚨 ${componentName} re-rendering too frequently:`, {
        renderCount: renderCount.current,
        timeSinceLastRender: `${timeSinceLastRender}ms`,
        timestamp: new Date().toISOString()
      })
    }

    // Log every 10th render
    if (renderCount.current % 10 === 0) {
      console.log(`📊 ${componentName} render #${renderCount.current}`, {
        timeSinceLastRender: `${timeSinceLastRender}ms`,
        timestamp: new Date().toISOString()
      })
    }
  })

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (enabled && renderCount.current > 0) {
        console.log(`🏁 ${componentName} unmounted after ${renderCount.current} renders`)
      }
    }
  }, [componentName, enabled])

  return null // This component doesn't render anything
} 