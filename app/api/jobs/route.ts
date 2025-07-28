import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), "data")

    // Read posts.json
    const postsFile = path.join(dataDir, "posts.json")
    let jobsData
    let jobs = []
    
    try {
      jobsData = await fs.readFile(postsFile, "utf8")
      const parsedData = JSON.parse(jobsData)
      
      // Validate that jobs is an array
      if (Array.isArray(parsedData)) {
        jobs = parsedData
      } else if (parsedData && Array.isArray(parsedData.jobs)) {
        jobs = parsedData.jobs
      } else {
        console.warn("Invalid jobs data format in posts.json")
        jobs = []
      }
    } catch (error) {
      console.error("Error reading posts.json:", error)
      jobs = []
    }

    // Read metadata - handle missing file gracefully
    let metadata = null
    try {
      const metadataFile = path.join(dataDir, "scraping-metadata.json")
      const metadataData = await fs.readFile(metadataFile, "utf8")
      metadata = JSON.parse(metadataData)
    } catch (error) {
      // File doesn't exist or can't be read - this is expected for new installations
      console.log("No scraping metadata found - this is normal for new installations")
      metadata = {
        lastUpdated: new Date().toISOString(),
        hasData: false,
        message: "No sync has been performed yet"
      }
    }

    return NextResponse.json({
      jobs,
      metadata,
      count: jobs.length,
      lastFetch: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error reading job data:", error)

    // Return empty data if files don't exist yet
    return NextResponse.json({
      jobs: [],
      metadata: {
        lastUpdated: new Date().toISOString(),
        hasData: false,
        message: "Job data not available. Run the job sync first."
      },
      count: 0,
      error: "Job data not available. Run the job sync first.",
      lastFetch: new Date().toISOString(),
    })
  }
}
