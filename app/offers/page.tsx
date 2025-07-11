import { JobList } from "@/components/job-list"
import type { Job } from "@/types/job"

const offerJobs: Job[] = [
  { id: "6", company: "Tech Innovations", position: "Software Engineer", dateApplied: "2023-03-10", status: "Offer" },
  { id: "7", company: "Data Insights", position: "Data Scientist", dateApplied: "2023-03-15", status: "Offer" },
]

export default function OffersPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Offers</h1>
      <JobList jobs={offerJobs} />
    </div>
  )
}
