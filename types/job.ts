export type Job = {
  id: string
  company: string
  position: string
  dateApplied: string
  status: "Applied" | "Interviewing" | "Offer" | "Rejected"
  industry: string
  estimatedSalary?: number
}
