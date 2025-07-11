"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Job } from "@/types/job"
import { formatDistanceToNow } from "date-fns"

interface JobCardProps {
  job: Job
  onViewDetails: (job: Job) => void
  onEdit: (job: Job) => void
  onDelete: (id: string) => void
}

export function JobCard({ job, onViewDetails, onEdit, onDelete }: JobCardProps) {
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
    <Card className="flex flex-col h-full">
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
      <CardContent className="flex-grow">
        <p className="text-sm line-clamp-3">{job.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline">{job.jobType}</Badge>
          <Badge variant="outline">{job.experienceLevel}</Badge>
          <Badge variant="outline">${job.salary.toLocaleString()}</Badge>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => onViewDetails(job)}>
          View Details
        </Button>
        <Button variant="secondary" onClick={() => onEdit(job)}>
          Edit
        </Button>
        <Button variant="destructive" onClick={() => onDelete(job.id)}>
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}
