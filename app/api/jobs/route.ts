import { NextResponse } from "next/server"
import { loadAllMergedJobs } from "@/services/job-integration-service"
import { mockJobs } from "@/data/mock-jobs"

export async function GET() {
  try {
    let jobs = await loadAllMergedJobs()

    // Fallback to mock data if the merged posts.json is empty
    if (!jobs || jobs.length === 0) {
      console.warn("posts.json is empty or not found. Falling back to mock data.")
      jobs = mockJobs
    }

    return NextResponse.json(jobs)
  } catch (error) {
    console.error("Error fetching jobs:", error)
    // In case of any error, also fallback to mock data
    return NextResponse.json(mockJobs, { status: 500 })
  }
}
