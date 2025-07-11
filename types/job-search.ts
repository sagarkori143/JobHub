export interface JobListing {
  id: string
  title: string
  company: string
  location: string
  type: string // e.g., "Full-time", "Part-time", "Contract"
  salary?: {
    min: number
    max: number
    currency: string
  }
  description: string
  requirements: string[]
  benefits: string[]
  postedDate: string // YYYY-MM-DD
  applicationDeadline?: string // YYYY-MM-DD
  industry: string
  experienceLevel: string // e.g., "Entry", "Mid", "Senior"
  remote: boolean
  companyLogo?: string // URL to company logo
  link?: string // Link to the original job posting
  // Added for scraped jobs
  scrapedAt?: string // ISO string of when it was scraped
  sourceUrl?: string // URL from where it was scraped
  expired?: boolean // True if job is no longer available
}

export interface JobSearchFilters {
  keywords: string
  location: string
  type: string
  experienceLevel: string
  salaryMin: string
  remote: boolean
}

export interface JobSearchCriteria {
  keywords?: string
  location?: string
  jobType?: ("Full-time" | "Part-time" | "Contract" | "Temporary" | "Internship")[]
  experienceLevel?: ("Entry-level" | "Associate" | "Mid-senior" | "Director" | "Executive")[]
  salaryMin?: number
  salaryMax?: number
  company?: string
}
