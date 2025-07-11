import { NextResponse } from "next/server"
import { jobDataService } from "@/services/job-data-service"
import type { Job } from "@/types/job"

export async function GET() {
  try {
    const jobs = await jobDataService.getJobs()
    return NextResponse.json(jobs)
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json({ message: "Failed to fetch jobs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const newJob: Omit<Job, "id"> = await request.json()
    const addedJob = await jobDataService.addJob(newJob)
    return NextResponse.json(addedJob, { status: 201 })
  } catch (error) {
    console.error("Error adding job:", error)
    return NextResponse.json({ message: "Failed to add job" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...updatedFields }: Job = await request.json()
    if (!id) {
      return NextResponse.json({ message: "Job ID is required for update" }, { status: 400 })
    }
    const updatedJob = await jobDataService.updateJob(id, updatedFields)
    if (!updatedJob) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 })
    }
    return NextResponse.json(updatedJob)
  } catch (error) {
    console.error("Error updating job:", error)
    return NextResponse.json({ message: "Failed to update job" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ message: "Job ID is required for deletion" }, { status: 400 })
    }
    const deleted = await jobDataService.deleteJob(id)
    if (!deleted) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 })
    }
    return NextResponse.json({ message: "Job deleted successfully" })
  } catch (error) {
    console.error("Error deleting job:", error)
    return NextResponse.json({ message: "Failed to delete job" }, { status: 500 })
  }
}
