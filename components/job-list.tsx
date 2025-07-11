import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Job } from "@/types/job"

interface JobListProps {
  jobs: Job[]
}

export function JobList({ jobs }: JobListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Company</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Date Applied</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => (
          <TableRow key={job.id}>
            <TableCell>{job.company}</TableCell>
            <TableCell>{job.position}</TableCell>
            <TableCell>{job.dateApplied}</TableCell>
            <TableCell>{job.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
