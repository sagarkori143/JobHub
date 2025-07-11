"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { JobEditForm } from "@/components/job-edit-form"
import { Badge } from "@/components/ui/badge"
import type { Job } from "@/types/job"

interface JobCardProps {
  job: Job
  className?: string
  onUpdate: (job: Job) => void
  onDelete: (job: Job) => void
  onMoveStatus: (job: Job, direction: "forward" | "backward") => void
}

const statusOrder = ["Applied", "Interviewing", "Offer", "Rejected"]

export function JobCard({ job, className, onUpdate, onDelete, onMoveStatus }: JobCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const currentStatusIndex = statusOrder.indexOf(job.status)

  const handleEditSubmit = (updatedJob: Job) => {
    onUpdate(updatedJob)
    setIsEditDialogOpen(false)
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-start text-lg">
          <div>
            <span>{job.position}</span>
            <Badge className="mt-1 block">{job.industry}</Badge>
          </div>
          <div className="space-x-2">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Pencil className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Job Application</DialogTitle>
                </DialogHeader>
                <JobEditForm job={job} onSubmit={handleEditSubmit} />
              </DialogContent>
            </Dialog>
            <Button size="sm" variant="outline" onClick={() => onDelete(job)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium">{job.company}</p>
        <p className="text-sm">Applied: {job.dateApplied}</p>
        <p className="text-sm">Estimated Salary: ${job.estimatedSalary || "N/A"}</p>
        <div className="flex justify-between items-center mt-2">
          {currentStatusIndex > 0 && (
            <Button size="sm" variant="outline" onClick={() => onMoveStatus(job, "backward")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <p className="text-sm font-medium">{job.status}</p>
          {currentStatusIndex < statusOrder.length - 1 && (
            <Button size="sm" variant="outline" onClick={() => onMoveStatus(job, "forward")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
