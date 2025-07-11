import type { JobListing } from "@/types/job-search"

export interface ScrapedJob {
  id: string
  title: string
  company: string
  location: string
  department?: string
  type: "Full-time" | "Part-time" | "Contract" | "Internship"
  salary: {
    min: number
    max: number
    currency: string
  }
  description: string
  requirements: string[]
  benefits: string[]
  postedDate: string
  applicationDeadline: string
  industry: string
  experienceLevel: "Entry" | "Mid" | "Senior" | "Executive"
  remote: boolean
  companyLogo?: string
  scrapedAt: string
  source: string
}

export class JobIntegrationService {
  private static instance: JobIntegrationService
  private scrapedJobs: ScrapedJob[] = []
  private lastScrapeTime: string | null = null

  static getInstance(): JobIntegrationService {
    if (!JobIntegrationService.instance) {
      JobIntegrationService.instance = new JobIntegrationService()
    }
    return JobIntegrationService.instance
  }

  // Load scraped jobs from storage
  loadScrapedJobs(): ScrapedJob[] {
    try {
      const stored = localStorage.getItem("scrapedJobs")
      if (stored) {
        this.scrapedJobs = JSON.parse(stored)
        this.lastScrapeTime = localStorage.getItem("lastScrapeTime")
      }
    } catch (error) {
      console.error("Error loading scraped jobs:", error)
    }
    return this.scrapedJobs
  }

  // Save scraped jobs to storage
  saveScrapedJobs(jobs: ScrapedJob[]): void {
    try {
      this.scrapedJobs = jobs
      this.lastScrapeTime = new Date().toISOString()
      localStorage.setItem("scrapedJobs", JSON.stringify(jobs))
      localStorage.setItem("lastScrapeTime", this.lastScrapeTime)
    } catch (error) {
      console.error("Error saving scraped jobs:", error)
    }
  }

  // Convert scraped jobs to JobListing format
  convertToJobListings(scrapedJobs: ScrapedJob[]): JobListing[] {
    return scrapedJobs.map((job) => ({
      ...job,
      // Ensure all required JobListing fields are present
      type: job.type || "Full-time",
      salary: job.salary || { min: 50000, max: 100000, currency: "USD" },
      description:
        job.description ||
        `Join ${job.company} as a ${job.title}. Exciting opportunity to work with cutting-edge technology.`,
      requirements: job.requirements || [
        "Bachelor's degree in relevant field",
        "Strong problem-solving skills",
        "Excellent communication abilities",
      ],
      benefits: job.benefits || ["Competitive salary", "Health insurance", "Professional development"],
      postedDate: job.postedDate || new Date().toISOString().split("T")[0],
      applicationDeadline:
        job.applicationDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      industry: job.industry || "Technology",
      experienceLevel: job.experienceLevel || "Mid",
      remote: job.remote ?? false,
      companyLogo: job.companyLogo || "/placeholder.svg?height=40&width=40",
    }))
  }

  // Get all jobs (scraped + existing)
  getAllJobs(existingJobs: JobListing[]): JobListing[] {
    const scrapedJobListings = this.convertToJobListings(this.scrapedJobs)

    // Remove duplicates based on title and company
    const allJobs = [...existingJobs]

    scrapedJobListings.forEach((scrapedJob) => {
      const isDuplicate = allJobs.some(
        (existingJob) =>
          existingJob.title.toLowerCase() === scrapedJob.title.toLowerCase() &&
          existingJob.company.toLowerCase() === scrapedJob.company.toLowerCase(),
      )

      if (!isDuplicate) {
        allJobs.push(scrapedJob)
      }
    })

    return allJobs
  }

  // Get only scraped jobs
  getScrapedJobs(): JobListing[] {
    return this.convertToJobListings(this.scrapedJobs)
  }

  // Get scraping statistics
  getScrapingStats() {
    return {
      totalScrapedJobs: this.scrapedJobs.length,
      lastScrapeTime: this.lastScrapeTime,
      companiesScraped: [...new Set(this.scrapedJobs.map((job) => job.company))].length,
      jobsByCompany: this.scrapedJobs.reduce(
        (acc, job) => {
          acc[job.company] = (acc[job.company] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
    }
  }

  // Check for new jobs based on user preferences
  checkForNewJobs(userPreferences: any): JobListing[] {
    const scrapedJobListings = this.convertToJobListings(this.scrapedJobs)

    return scrapedJobListings.filter((job) => {
      // Check keywords
      const matchesKeywords = userPreferences.keywords.some(
        (keyword: string) =>
          job.title.toLowerCase().includes(keyword.toLowerCase()) ||
          job.description.toLowerCase().includes(keyword.toLowerCase()),
      )

      // Check industries
      const matchesIndustry =
        userPreferences.industries.length === 0 || userPreferences.industries.includes(job.industry)

      // Check locations
      const matchesLocation =
        userPreferences.locations.length === 0 ||
        userPreferences.locations.some(
          (location: string) =>
            job.location.toLowerCase().includes(location.toLowerCase()) ||
            (location.toLowerCase() === "remote" && job.remote),
        )

      // Check job types
      const matchesJobType = userPreferences.jobTypes.length === 0 || userPreferences.jobTypes.includes(job.type)

      // Check experience levels
      const matchesExperience =
        userPreferences.experienceLevels.length === 0 || userPreferences.experienceLevels.includes(job.experienceLevel)

      // Check salary range
      const avgSalary = (job.salary.min + job.salary.max) / 2
      const matchesSalary = avgSalary >= userPreferences.salaryRange.min && avgSalary <= userPreferences.salaryRange.max

      return (
        matchesKeywords && matchesIndustry && matchesLocation && matchesJobType && matchesExperience && matchesSalary
      )
    })
  }
}

export const jobIntegrationService = JobIntegrationService.getInstance()
