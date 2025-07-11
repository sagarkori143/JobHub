import { JobList } from "@/components/job-list"
import type { Job } from "@/types/job"

const rejectedJobs: Job[] = [
  {
    id: "8",
    company: "StartUp Co",
    position: "UX Designer",
    dateApplied: "2023-02-01",
    status: "Rejected",
    industry: "Design",
  },
  {
    id: "9",
    company: "Big Tech",
    position: "Software Engineer",
    dateApplied: "2023-02-15",
    status: "Rejected",
    industry: "Technology",
  },
  {
    id: "10",
    company: "Finance Firm",
    position: "Data Analyst",
    dateApplied: "2023-03-01",
    status: "Rejected",
    industry: "Finance",
  },
]

export default function RejectedPage() {
  return (
    <div className="space-y-4 p-4 md:p-0">
      {" "}
      {/* Added responsive padding */}
      <h1 className="text-2xl md:text-3xl font-bold">Rejected Applications</h1>
      <JobList jobs={rejectedJobs} />
    </div>
  )
}
