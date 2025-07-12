import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function GET() {
  try {
    // Read the sync summary file
    const summaryFile = path.join(process.cwd(), "data", "job-sync-summary.json")
    let summary
    try {
      const summaryData = await fs.readFile(summaryFile, "utf8")
      summary = JSON.parse(summaryData)
    } catch (err) {
      // File does not exist or cannot be read
      return NextResponse.json({
        success: true,
        lastUpdated: null,
        totalJobs: 0,
        hasData: false,
        message: "No sync has been performed yet."
      })
    }

    // Get last sync time and total jobs
    const lastUpdated = summary?.syncSession?.endTime || null
    // Sum all jobs from all companies
    const totalJobs = Array.isArray(summary?.results)
      ? summary.results.reduce((sum, r) => sum + (r.total || 0), 0)
      : 0
    const hasData = totalJobs > 0

    return NextResponse.json({
      success: true,
      lastUpdated,
      totalJobs,
      hasData
    })
  } catch (error) {
    console.error('Error in jobs metadata API:', error)
    return NextResponse.json({
      error: 'Internal server error',
      lastUpdated: null
    }, { status: 500 })
  }
} 