import type { JobType } from "./job"

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

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  joinedDate: string
  gender?: string // Added gender field
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
