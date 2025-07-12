import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function GET() {
  try {
    const metadataFile = path.join(process.cwd(), "data", "sync-metadata.json")
    
    try {
      const metadataData = await fs.readFile(metadataFile, "utf8")
      const metadata = JSON.parse(metadataData)
      
      return NextResponse.json({
        success: true,
        ...metadata
      })
    } catch (error) {
      // If no sync metadata exists, create a mock one
      const now = new Date()
      const nextUpdate = new Date(now.getTime() + (2 * 60 * 60 * 1000)) // 2 hours from now
      
      // Round to the nearest 2-hour interval
      const hours = nextUpdate.getHours()
      const roundedHours = Math.floor(hours / 2) * 2
      const nextCronUpdate = new Date(nextUpdate)
      nextCronUpdate.setHours(roundedHours, 0, 0, 0)
      
      // If the rounded time is in the past, add 2 hours
      if (nextCronUpdate.getTime() <= now.getTime()) {
        nextCronUpdate.setHours(nextCronUpdate.getHours() + 2)
      }
      
      const mockMetadata = {
        lastSync: null,
        nextSync: nextCronUpdate.toISOString(),
        syncInterval: "2 hours",
        cronSchedule: "0 */2 * * *",
        hasRealData: false,
        totalJobs: 0,
        companiesProcessed: 0,
        newJobsFound: 0,
        expiredJobsFound: 0
      }
      
      return NextResponse.json({
        success: true,
        ...mockMetadata
      })
    }
    
  } catch (error) {
    console.error("Error reading sync metadata:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to read sync metadata",
      lastSync: null,
      nextSync: null,
      hasRealData: false
    }, { status: 500 })
  }
} 