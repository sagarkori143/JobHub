import type { Job } from "@/types/job"
import { v4 as uuidv4 } from "uuid"
import { mockJobs } from "@/data/mock-jobs"

// This is a mock in-memory data store for jobs.
// In a real application, this would interact with a database (e.g., PostgreSQL, MongoDB).
let jobs: Job[] = [...mockJobs] // Initialize with mock data

export const jobDataService = {
  /**
   * Retrieves all jobs from the data store.
   * @returns A promise that resolves with an array of Job objects.
   */
  async getJobs(): Promise<Job[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))
    return JSON.parse(JSON.stringify(jobs)) // Return a deep copy to prevent direct modification
  },

  /**
   * Retrieves a single job by its ID.
   * @param id The ID of the job to retrieve.
   * @returns A promise that resolves with the Job object or null if not found.
   */
  async getJobById(id: string): Promise<Job | null> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const job = jobs.find((j) => j.id === id)
    return job ? JSON.parse(JSON.stringify(job)) : null
  },

  /**
   * Adds a new job to the data store.
   * @param newJob The job object to add (without an ID).
   * @returns A promise that resolves with the newly added Job object (including its generated ID).
   */
  async addJob(newJob: Omit<Job, "id">): Promise<Job> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const jobWithId: Job = { ...newJob, id: uuidv4() }
    jobs.push(jobWithId)
    return JSON.parse(JSON.stringify(jobWithId))
  },

  /**
   * Updates an existing job in the data store.
   * @param id The ID of the job to update.
   * @param updatedFields An object containing the fields to update.
   * @returns A promise that resolves with the updated Job object or null if the job was not found.
   */
  async updateJob(id: string, updatedFields: Partial<Job>): Promise<Job | null> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = jobs.findIndex((j) => j.id === id)
    if (index > -1) {
      jobs[index] = { ...jobs[index], ...updatedFields }
      return JSON.parse(JSON.stringify(jobs[index]))
    }
    return null
  },

  /**
   * Deletes a job from the data store by its ID.
   * @param id The ID of the job to delete.
   * @returns A promise that resolves with true if the job was deleted, false otherwise.
   */
  async deleteJob(id: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const initialLength = jobs.length
    jobs = jobs.filter((j) => j.id !== id)
    return jobs.length < initialLength
  },

  /**
   * Resets the job data to its initial mock state.
   * Useful for testing or development.
   */
  async resetJobs(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100))
    jobs = [...mockJobs]
  },
}
