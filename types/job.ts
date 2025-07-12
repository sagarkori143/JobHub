export type Job = {
  id: string
  company: string
  position: string
  dateApplied: string
  status: "Applied" | "Interviewing" | "Offer" | "Rejected"
  industry: string
  estimatedSalary?: number
  jobType?: "Full-time" | "Part-time" | "Contract" | "Internship"
  companyLogo?: string
}
