export type JobStatus = "Applied" | "Interviewing" | "Offers" | "Rejected" | "Wishlist"

export interface Job {
  id: string
  title: string
  company: string
  location: string
  description: string
  requirements: string[]
  responsibilities: string[]
  salary: number
  jobType: "Full-time" | "Part-time" | "Contract" | "Temporary" | "Internship"
  experienceLevel: "Entry-level" | "Associate" | "Mid-senior" | "Director" | "Executive"
  datePosted: string
  status: JobStatus
  notes?: string
  contactEmail?: string
  applicationLink?: string
  skills: string[]
}
