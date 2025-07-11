"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Job } from "@/types/job"
import { formatDistanceToNow } from "date-fns"

interface JobListingCardProps {
  job: Job
  onClick: (job: Job) => void
}

export function JobListingCard({ job, onClick }: JobListingCardProps) {
  const timeAgo = formatDistanceToNow(new Date(job.datePosted), { addSuffix: true })

  const getStatusVariant = (status: Job["status"]) => {
    switch (status) {
      case "Applied":
        return "applied"
      case "Interviewing":
        return "interviewing"
      case "Offers":
        return "offers"
      case "Rejected":
        return "rejected"
      case "Wishlist":
        return "wishlist"
      default:
        return "default"
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onClick(job)}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{job.title}</CardTitle>
          <Badge variant={getStatusVariant(job.status)}>{job.status}</Badge>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          {job.company} - {job.location}
        </CardDescription>
        <p className="text-xs text-muted-foreground">{timeAgo}</p>
      </CardHeader>
      <CardContent>
        <p className="text-sm line-clamp-3">{job.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline">{job.jobType}</Badge>
          <Badge variant="outline">{job.experienceLevel}</Badge>
          <Badge variant="outline">${job.salary.toLocaleString()}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
