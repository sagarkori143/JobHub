import { NextRequest, NextResponse } from "next/server"
import { notificationHashmapService } from "@/services/notification-hashmap-service"
import { mockJobs } from "@/data/mock-jobs"

export async function POST(request: NextRequest) {
  try {
    const { newJobs, testUserEmail } = await request.json()

    if (!newJobs || !Array.isArray(newJobs)) {
      return NextResponse.json(
        { error: "newJobs array is required" },
        { status: 400 }
      )
    }

    console.log(`📧 Processing notifications for ${newJobs.length} new jobs using hash map service`)

    // Add new jobs to the notification service
    notificationHashmapService.addNewJobs(newJobs)

    // Process notifications using hash map approach (with testUserEmail if provided)
    await notificationHashmapService.processNotifications(testUserEmail, !!testUserEmail)

    // Get hash map statistics
    const stats = notificationHashmapService.getHashMapStats()

    return NextResponse.json({ 
      success: true, 
      message: `Processed notifications for ${newJobs.length} jobs using hash map approach`,
      stats
    })

  } catch (error) {
    console.error("Error processing notifications:", error)
    return NextResponse.json(
      { error: "Failed to process notifications" },
      { status: 500 }
    )
  }
}

// GET endpoint to manually trigger notifications with mock data (for testing)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const testUserEmail = searchParams.get('testUserEmail')
    console.log("📧 Manually triggering notifications with mock data using hash map service")

    // Use a subset of mock jobs as "new" jobs for testing
    const mockNewJobs = mockJobs.slice(0, 3).map(job => ({
      ...job,
      id: `new-${job.id}`,
      postedDate: new Date().toISOString().split('T')[0]
    }))

    // Add new jobs to the notification service
    notificationHashmapService.addNewJobs(mockNewJobs)

    // Process notifications using hash map approach (with testUserEmail if provided)
    await notificationHashmapService.processNotifications(testUserEmail, !!testUserEmail)

    // Get hash map statistics and details
    const stats = notificationHashmapService.getHashMapStats()
    const details = notificationHashmapService.getHashMapDetails()

    return NextResponse.json({ 
      success: true, 
      message: `Processed notifications for ${mockNewJobs.length} mock jobs using hash map approach`,
      jobsProcessed: mockNewJobs.length,
      stats,
      details
    })

  } catch (error) {
    console.error("Error processing mock notifications:", error)
    return NextResponse.json(
      { error: "Failed to process mock notifications" },
      { status: 500 }
    )
  }
} 