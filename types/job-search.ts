export type JobType = "Full-time" | "Part-time" | "Contract" | "Internship"

export type JobStatus = "Applied" | "Interviewing" | "Offer" | "Rejected" | "Wishlist"

export interface Job {
  id: string
  title: string
  company: string
  location: string
  description: string
  requirements: string[]
  responsibilities: string[]
  salary: string
  status: JobStatus
  dateApplied: string
  contactEmail: string
  notes: string
  jobType: JobType // Added jobType field
  userId: string // Added userId to link jobs to users
  atsScore?: number // Optional ATS score
}

export interface JobListing {
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
  isActive?: boolean
}

export interface JobFilters {
  search: string
  location: string
  jobType: string
  experienceLevel: string
  remote: boolean
  industry: string
}

export type UserRole = "admin" | "user"

export type OccupationType = 
  | "Software Engineer"
  | "Frontend Developer" 
  | "Backend Developer"
  | "Full Stack Developer"
  | "DevOps Engineer"
  | "Data Scientist"
  | "Data Analyst"
  | "Product Manager"
  | "UI/UX Designer"
  | "Marketing Manager"
  | "Sales Representative"
  | "Business Analyst"
  | "Project Manager"
  | "HR Manager"
  | "Finance Analyst"
  | "Customer Support"
  | "Other"

export interface User {
  id: string
  name: string
  email: string
  avatar?: string | null
  role: UserRole // Changed to UserRole type for access control
  occupation?: OccupationType | string // Separate field for job title
  joinedDate: string
  gender?: string // Added gender field
  // New fields for personalized resume scoring
  target_field?: string
  target_companies?: string[]
  target_positions?: string[]
  experience_level?: string
  jobPreferences?: any // Allow jobPreferences for localStorage hydration
  // Resume and ATS scoring fields
  resumeUrl?: string | null
  atsScores?: any[] // Array of ATS scores with timestamps
  streaks?: any // Streaks data (days active, applications sent, etc.)
  // New streak tracking fields
  currentStreak?: number
  longestStreak?: number
  totalApplications?: number
  loginDates?: string[]
  lastLoginDate?: string | null
  lastApplicationDate?: string | null
  jobsTracking?: any[];
}

export interface JobTag {
  id: string
  name: string
  userId: string
}

export interface UserTagSubscription {
  userId: string
  tagId: string
}
