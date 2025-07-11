export type JobListing = {
  id: string
  title: string
  company: string
  location: string
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
}

export type JobFilters = {
  search: string
  location: string
  jobType: string[]
  experienceLevel: string[]
  industry: string[]
  remote: boolean | null
  salaryRange: {
    min: number
    max: number
  }
}
