import { JobList } from "@/components/job-list"
import type { Job } from "@/types/job"

const rejectedJobs: Job[] = [
  { id: "8", company: "StartUp Co", position: "UX Designer", dateApplied: "2023-02-01", status: "Rejected" },
  { id: "9", company: "Big Tech", position: "Software Engineer", dateApplied: "2023-02-15", status: "Rejected" },
  { id: "10", company: "Finance Firm", position: "Data Analyst", dateApplied: "2023-03-01", status: "Rejected" },
]

export default function RejectedPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Rejected Applications</h1>
      <JobList jobs={rejectedJobs} />
    </div>
  )
}
