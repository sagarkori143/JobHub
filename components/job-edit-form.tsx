"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Job } from "@/types/job"

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Hospitality",
  "Media",
  "Transportation",
  "Energy",
  "Agriculture",
  "Construction",
]

interface JobEditFormProps {
  job: Job
  onSubmit: (updatedJob: Job) => void
}

export function JobEditForm({ job, onSubmit }: JobEditFormProps) {
  const [editedJob, setEditedJob] = useState(job)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(editedJob)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="company">Company</Label>
        <Input
          id="company"
          value={editedJob.company}
          onChange={(e) => setEditedJob({ ...editedJob, company: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="position">Position</Label>
        <Input
          id="position"
          value={editedJob.position}
          onChange={(e) => setEditedJob({ ...editedJob, position: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="industry">Industry</Label>
        <Select value={editedJob.industry} onValueChange={(value) => setEditedJob({ ...editedJob, industry: value })}>
          <SelectTrigger id="industry">
            <SelectValue placeholder="Select an industry" />
          </SelectTrigger>
          <SelectContent>
            {industries.map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="estimatedSalary">Estimated Salary</Label>
        <Input
          id="estimatedSalary"
          type="number"
          value={editedJob.estimatedSalary || ""}
          onChange={(e) => setEditedJob({ ...editedJob, estimatedSalary: Number(e.target.value) })}
        />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select
          value={editedJob.status}
          onValueChange={(value: Job["status"]) => setEditedJob({ ...editedJob, status: value })}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Applied">Applied</SelectItem>
            <SelectItem value="Interviewing">Interviewing</SelectItem>
            <SelectItem value="Offer">Offer</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit">Update Job Application</Button>
    </form>
  )
}
