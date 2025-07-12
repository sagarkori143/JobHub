import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), "data")

    // Read posts.json
    const postsFile = path.join(dataDir, "posts.json")
    const jobsData = await fs.readFile(postsFile, "utf8")
    const jobs = JSON.parse(jobsData)

    // Read metadata
    let metadata = null
    try {
      const metadataFile = path.join(dataDir, "scraping-metadata.json")
      const metadataData = await fs.readFile(metadataFile, "utf8")
      metadata = JSON.parse(metadataData)
    } catch (error) {
      console.log("No metadata file found")
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
      metadata: null,
      count: 0,
      error: "Job data not available. Run the job sync first.",
      lastFetch: new Date().toISOString(),
    })
  }
}
