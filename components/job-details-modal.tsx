"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Job } from "@/types/job"
import { ExternalLink, Mail } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface JobDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  job: Job
}

export function JobDetailsModal({ isOpen, onClose, job }: JobDetailsModalProps) {
  if (!job) return null

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{job.title}</DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground">
            {job.company} - {job.location}
          </DialogDescription>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant={getStatusVariant(job.status)}>{job.status}</Badge>
            <Badge variant="outline">{job.jobType}</Badge>
            <Badge variant="outline">{job.experienceLevel}</Badge>
            <Badge variant="outline">${job.salary.toLocaleString()}</Badge>
            <Badge variant="outline">Posted: {job.datePosted}</Badge>
          </div>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-6 -mr-6">
          {" "}
          {/* Added pr-6 and -mr-6 to account for scrollbar */}
          <div className="grid gap-4 py-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">{job.description}</p>
            </div>

            {job.requirements && job.requirements.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Requirements</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {job.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.responsibilities && job.responsibilities.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Responsibilities</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {job.responsibilities.map((resp, index) => (
                    <li key={index}>{resp}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.skills && job.skills.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {job.notes && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground">{job.notes}</p>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              {job.applicationLink && (
                <Button asChild>
                  <a href={job.applicationLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" /> Apply Now
                  </a>
                </Button>
              )}
              {job.contactEmail && (
                <Button variant="outline" asChild>
                  <a href={`mailto:${job.contactEmail}`}>
                    <Mail className="mr-2 h-4 w-4" /> Contact
                  </a>
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
