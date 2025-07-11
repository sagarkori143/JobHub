import type { JobListing } from "@/types/job-search"
import { mockJobs } from "@/data/mock-jobs"

// In a real application, this would fetch from a backend API
// For this example, we simulate fetching from a static JSON file
// or falling back to mock data.

export async function getJobs(): Promise<JobListing[]> {
  try {
    // In a real Next.js app, this would be a fetch to your API route:
    // const response = await fetch('/api/jobs', { cache: 'no-store' });
    // const jobs = await response.json();

    // For Next.js, we directly import the mock data or simulate a fetch
    // from the merged posts.json if it were accessible directly.
    // Since posts.json is generated server-side (or during build),
    // we'll simulate its content or use mockJobs as a fallback.

    // Simulate fetching from posts.json
    const response = await fetch("/posts.json") // This path would work if posts.json was in public
    if (response.ok) {
      const jobs = await response.json()
      if (jobs && jobs.length > 0) {
        return jobs
      }
    }

    console.warn("Could not load jobs from /posts.json or it was empty. Falling back to mock data.")
    return mockJobs
  } catch (error) {
    console.error("Error fetching jobs:", error)
    // Fallback to mock data in case of any fetch error
    return mockJobs
  }
}
