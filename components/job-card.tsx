"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, ChevronLeft, ChevronRight, Building } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { JobEditForm } from "@/components/job-edit-form"
import { Badge } from "@/components/ui/badge"
import { getCompanyLogo } from "@/lib/company-logos"
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
  const [companyLogo, setCompanyLogo] = useState<string>("")
  const [isLoadingLogo, setIsLoadingLogo] = useState(false)
  const currentStatusIndex = statusOrder.indexOf(job.status)

  useEffect(() => {
    // Always use the central mapping for company logos
    const logo = getCompanyLogo(job.company)
    setCompanyLogo(logo)
  }, [job.company])

  const handleEditSubmit = (updatedJob: Job) => {
    onUpdate(updatedJob)
    setIsEditDialogOpen(false)
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              {job.position}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {job.industry}
            </Badge>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                  <Pencil className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Job Application</DialogTitle>
                </DialogHeader>
                <JobEditForm 
                  job={job} 
                  onUpdate={handleEditSubmit} 
                  onClose={() => setIsEditDialogOpen(false)} 
                />
              </DialogContent>
            </Dialog>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onDelete(job)}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <img 
                src={companyLogo} 
                alt={`${job.company} logo`}
                className="w-8 h-8 rounded-md object-cover border border-gray-200"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=32&width=32"
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{job.company}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Applied: {job.dateApplied}</p>
          <p className="text-sm text-gray-600">
            Salary: ${job.estimatedSalary || "N/A"}
          </p>
          <p className="text-sm text-gray-600">Type: {job.jobType}</p>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {currentStatusIndex > 0 && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onMoveStatus(job, "backward")}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
            )}
            <Badge 
              variant={
                job.status === "Applied" ? "default" :
                job.status === "Interviewing" ? "secondary" :
                job.status === "Offer" ? "outline" :
                "destructive"
              }
              className="text-xs"
            >
              {job.status}
            </Badge>
            {currentStatusIndex < statusOrder.length - 1 && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onMoveStatus(job, "forward")}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
