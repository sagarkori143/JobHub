"use client"

import type { Job } from "@/types/job"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2, ExternalLink } from "lucide-react"

interface JobCardProps {
  job: Job
  onEdit: (job: Job) => void
  onDelete: (id: string) => void
}

export function JobCard({ job, onEdit, onDelete }: JobCardProps) {
  const getStatusVariant = (status: Job["status"]) => {
    switch (status) {
      case "Applied":
        return "default"
      case "Interviewing":
        return "secondary"
      case "Offer":
        return "default" // You might want a specific color for offers
      case "Rejected":
        return "destructive"
      case "Wishlist":
        return "outline"
      default:
        return "default"
    }
  }

  const getStatusColorClass = (status: Job["status"]) => {
    switch (status) {
      case "Applied":
        return "bg-blue-500 text-white"
      case "Interviewing":
        return "bg-yellow-500 text-white"
      case "Offer":
        return "bg-green-500 text-white"
      case "Rejected":
        return "bg-red-500 text-white"
      case "Wishlist":
        return "bg-gray-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  return (
    <Card className="relative flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-semibold">{job.title}</CardTitle>
            <CardDescription className="text-gray-600">{job.company}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(job)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(job.id)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
              {job.link && (
                <DropdownMenuItem asChild>
                  <a href={job.link} target="_blank" rel="noopener noreferrer" className="flex items-center">
                    <ExternalLink className="mr-2 h-4 w-4" /> View Job
                  </a>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-2">
          <Badge className={getStatusColorClass(job.status)}>{job.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 text-sm text-gray-700 space-y-2">
        <p>
          <strong>Location:</strong> {job.location}
        </p>
        <p>
          <strong>Date Applied:</strong> {job.dateApplied}
        </p>
        {job.interviewDate && (
          <p>
            <strong>Interview Date:</strong> {new Date(job.interviewDate).toLocaleString()}
          </p>
        )}
        {job.offerDetails && (
          <p>
            <strong>Offer Details:</strong> {job.offerDetails}
          </p>
        )}
        {job.rejectionReason && (
          <p>
            <strong>Rejection Reason:</strong> {job.rejectionReason}
          </p>
        )}
        {job.notes && (
          <p>
            <strong>Notes:</strong> {job.notes}
          </p>
        )}
        {job.contactPerson && (
          <p>
            <strong>Contact:</strong> {job.contactPerson}
            {job.contactEmail && ` (${job.contactEmail})`}
            {job.contactPhone && ` (${job.contactPhone})`}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
