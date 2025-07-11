import type { Job } from "@/types/job"
import { mockJobs } from "@/data/mock-jobs"

// This service would handle integrations with external job boards (e.g., LinkedIn, Indeed APIs)
// For now, it uses mock data and simulates API calls.

export const jobIntegrationService = {
  /**
   * Simulates fetching jobs from an external source.
   * In a real application, this would involve API calls to job boards.
   * @returns A promise that resolves with an array of Job objects.
   */
  async fetchJobsFromExternalSources(): Promise<Job[]> {
    console.log("Simulating fetching jobs from external sources...")
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Return a subset of mock jobs to simulate new data
    const newJobs = mockJobs.filter((job, index) => index % 2 === 0) // Example: every other job
    return newJobs.map((job) => ({
      ...job,
      id: `external-${job.id}-${Date.now()}`, // Ensure unique IDs for "new" jobs
      datePosted: new Date().toISOString().split("T")[0], // Set current date
      status: "Wishlist", // New jobs are typically in wishlist
    }))
  },

  /**
   * Simulates applying to a job on an external platform.
   * @param jobId The ID of the job to apply to.
   * @param applicationData Data required for the application (e.g., resume, cover letter).
   * @returns A promise that resolves with a success status.
   */
  async applyToJob(jobId: string, applicationData: any): Promise<{ success: boolean; message: string }> {
    console.log(`Simulating applying to job ${jobId} with data:`, applicationData)
    await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate network delay

    // In a real scenario, this would interact with the job board's application API
    if (Math.random() > 0.1) {
      // 90% success rate
      return { success: true, message: `Successfully applied to job ${jobId}.` }
    } else {
      return { success: false, message: `Failed to apply to job ${jobId}. Please try again.` }
    }
  },

  /**
   * Simulates checking the status of an application on an external platform.
   * @param jobId The ID of the job to check status for.
   * @returns A promise that resolves with the updated status.
   */
  async checkApplicationStatus(jobId: string): Promise<{ status: Job["status"]; message: string }> {
    console.log(`Simulating checking status for job ${jobId}...`)
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate network delay

    const statuses: Job["status"][] = ["Applied", "Interviewing", "Offers", "Rejected"]
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

    return { status: randomStatus, message: `Status for ${jobId}: ${randomStatus}` }
  },
}
