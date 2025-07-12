"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DialogFooter } from "@/components/ui/dialog"
import { getCompanyLogo, getCompanyLogoAsync } from "@/lib/company-logos"
import type { Job } from "@/types/job"

interface JobEditFormProps {
  job: Job
  onUpdate: (job: Job) => void
  onClose: () => void
}

const jobStatuses = ["Applied", "Interviewing", "Offer", "Rejected"]
const jobIndustries = ["Technology", "Healthcare", "Finance", "Education", "Marketing", "Design", "Retail"]
const jobTypes = ["Full-time", "Part-time", "Contract", "Internship"]

export function JobEditForm({ job, onUpdate, onClose }: JobEditFormProps) {
  const [company, setCompany] = useState(job.company)
  const [position, setPosition] = useState(job.position)
  const [dateApplied, setDateApplied] = useState(job.dateApplied)
  const [status, setStatus] = useState<Job["status"]>(job.status)
  const [industry, setIndustry] = useState(job.industry)
  const [estimatedSalary, setEstimatedSalary] = useState(job.estimatedSalary || "")
  const [jobType, setJobType] = useState<Job["jobType"]>(job.jobType || "Full-time")

  useEffect(() => {
    setCompany(job.company)
    setPosition(job.position)
    setDateApplied(job.dateApplied)
    setStatus(job.status)
    setIndustry(job.industry)
    setEstimatedSalary(job.estimatedSalary || "")
    setJobType(job.jobType || "Full-time")
  }, [job])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Get company logo asynchronously
    const companyLogo = await getCompanyLogoAsync(company)
    
    onUpdate({
      ...job,
      company,
      position,
      dateApplied,
      status,
      industry,
      estimatedSalary: estimatedSalary ? Number(estimatedSalary) : undefined,
      jobType,
      companyLogo,
    })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <Label htmlFor="company">Company</Label>
        <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="position">Position</Label>
        <Input id="position" value={position} onChange={(e) => setPosition(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="dateApplied">Date Applied</Label>
        <Input
          id="dateApplied"
          type="date"
          value={dateApplied}
          onChange={(e) => setDateApplied(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={(value: Job["status"]) => setStatus(value)}>
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {jobStatuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="industry">Industry</Label>
        <Select value={industry} onValueChange={setIndustry}>
          <SelectTrigger id="industry">
            <SelectValue placeholder="Select industry" />
          </SelectTrigger>
          <SelectContent>
            {jobIndustries.map((i) => (
              <SelectItem key={i} value={i}>
                {i}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="jobType">Job Type</Label>
        <Select value={jobType} onValueChange={(value: Job["jobType"]) => setJobType(value)}>
          <SelectTrigger id="jobType">
            <SelectValue placeholder="Select job type" />
          </SelectTrigger>
          <SelectContent>
            {jobTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
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
          value={estimatedSalary}
          onChange={(e) => setEstimatedSalary(e.target.value)}
          placeholder="e.g., 80000"
        />
      </div>
      <DialogFooter>
        <Button type="submit">Update Application</Button>
      </DialogFooter>
    </form>
  )
}
