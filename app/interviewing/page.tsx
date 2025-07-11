import { JobList } from "@/components/job-list"
import type { Job } from "@/types/job"

const interviewingJobs: Job[] = [
  {
    id: "4",
    company: "Innovate LLC",
    position: "Product Manager",
    dateApplied: "2023-04-15",
    status: "Interviewing",
    industry: "Technology",
  },
  {
    id: "5",
    company: "Software Systems",
    position: "Backend Developer",
    dateApplied: "2023-04-20",
    status: "Interviewing",
    industry: "Technology",
  },
]

export default function InterviewingPage() {
  return (
    <div className="space-y-4 p-4 md:p-0">
      {" "}
      {/* Added responsive padding */}
      <h1 className="text-2xl md:text-3xl font-bold">Interviewing</h1>
      <JobList jobs={interviewingJobs} />
    </div>
  )
}
