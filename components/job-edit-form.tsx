"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Job } from "@/types/job"

interface JobEditFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (job: Job) => void
  job: Job
}

export function JobEditForm({ isOpen, onClose, onSubmit, job }: JobEditFormProps) {
  const [title, setTitle] = useState(job.title)
  const [company, setCompany] = useState(job.company)
  const [location, setLocation] = useState(job.location)
  const [status, setStatus] = useState<Job["status"]>(job.status)
  const [dateApplied, setDateApplied] = useState(job.dateApplied)
  const [notes, setNotes] = useState(job.notes || "")
  const [contactPerson, setContactPerson] = useState(job.contactPerson || "")
  const [contactEmail, setContactEmail] = useState(job.contactEmail || "")
  const [contactPhone, setContactPhone] = useState(job.contactPhone || "")
  const [interviewDate, setInterviewDate] = useState(job.interviewDate || "")
  const [offerDetails, setOfferDetails] = useState(job.offerDetails || "")
  const [rejectionReason, setRejectionReason] = useState(job.rejectionReason || "")
  const [link, setLink] = useState(job.link || "")

  useEffect(() => {
    if (job) {
      setTitle(job.title)
      setCompany(job.company)
      setLocation(job.location)
      setStatus(job.status)
      setDateApplied(job.dateApplied)
      setNotes(job.notes || "")
      setContactPerson(job.contactPerson || "")
      setContactEmail(job.contactEmail || "")
      setContactPhone(job.contactPhone || "")
      setInterviewDate(job.interviewDate || "")
      setOfferDetails(job.offerDetails || "")
      setRejectionReason(job.rejectionReason || "")
      setLink(job.link || "")
    }
  }, [job])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const updatedJob: Job = {
      ...job,
      title,
      company,
      location,
      status,
      dateApplied,
      notes,
      contactPerson,
      contactEmail,
      contactPhone,
      interviewDate,
      offerDetails,
      rejectionReason,
      link,
    }
    onSubmit(updatedJob)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job Application</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Job Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="company" className="text-right">
              Company
            </Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select value={status} onValueChange={(value: Job["status"]) => setStatus(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Applied">Applied</SelectItem>
                <SelectItem value="Interviewing">Interviewing</SelectItem>
                <SelectItem value="Offer">Offer</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Wishlist">Wishlist</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dateApplied" className="text-right">
              Date Applied
            </Label>
            <Input
              id="dateApplied"
              type="date"
              value={dateApplied}
              onChange={(e) => setDateApplied(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="link" className="text-right">
              Job Link
            </Label>
            <Input
              id="link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="col-span-3"
              placeholder="e.g., https://example.com/job-post"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contactPerson" className="text-right">
              Contact Person
            </Label>
            <Input
              id="contactPerson"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contactEmail" className="text-right">
              Contact Email
            </Label>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contactPhone" className="text-right">
              Contact Phone
            </Label>
            <Input
              id="contactPhone"
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="col-span-3"
            />
          </div>
          {status === "Interviewing" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="interviewDate" className="text-right">
                Interview Date
              </Label>
              <Input
                id="interviewDate"
                type="datetime-local"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="col-span-3"
              />
            </div>
          )}
          {status === "Offer" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="offerDetails" className="text-right">
                Offer Details
              </Label>
              <Textarea
                id="offerDetails"
                value={offerDetails}
                onChange={(e) => setOfferDetails(e.target.value)}
                className="col-span-3"
              />
            </div>
          )}
          {status === "Rejected" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rejectionReason" className="text-right">
                Rejection Reason
              </Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="col-span-3"
              />
            </div>
          )}
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
