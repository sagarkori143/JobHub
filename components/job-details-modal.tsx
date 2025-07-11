"use client"

import type { JobListing } from "@/types/job-search"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

interface JobDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  job: JobListing
}

export function JobDetailsModal({ isOpen, onClose, job }: JobDetailsModalProps) {
  const formatSalary = (salary?: { min: number; max: number; currency: string }) => {
    if (!salary) return "N/A"
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: salary.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[700px] lg:max-w-[900px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{job.title}</DialogTitle>
          <DialogDescription className="text-lg text-gray-600">{job.company}</DialogDescription>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-700 mt-2">
            <span>{job.remote ? "Remote" : job.location}</span>
            <span>{job.type}</span>
            <span>{formatSalary(job.salary)}</span>
            <span>{job.experienceLevel} Level</span>
            <span>{job.industry}</span>
          </div>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4 -mr-4">
          <div className="py-4 space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Requirements</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {job.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>

            {job.benefits && job.benefits.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Benefits</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {job.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span>
                <strong>Posted:</strong> {job.postedDate}
              </span>
              {job.applicationDeadline && (
                <span>
                  <strong>Deadline:</strong> {job.applicationDeadline}
                </span>
              )}
              {job.scrapedAt && (
                <span>
                  <strong>Scraped:</strong> {new Date(job.scrapedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </ScrollArea>
        {job.link && (
          <div className="flex justify-end pt-4 border-t">
            <Button asChild>
              <a href={job.link} target="_blank" rel="noopener noreferrer">
                Apply Now <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
