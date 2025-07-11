export interface Job {
  id: string
  title: string
  company: string
  location: string
  status: "Applied" | "Interviewing" | "Offer" | "Rejected" | "Wishlist"
  dateApplied: string
  notes?: string
  contactPerson?: string
  contactEmail?: string
  contactPhone?: string
  interviewDate?: string
  offerDetails?: string
  rejectionReason?: string
  link?: string
}
