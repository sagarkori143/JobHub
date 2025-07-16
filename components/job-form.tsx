"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCompanyLogo } from "@/lib/company-logos"
import type { Job } from "@/types/job"

interface JobFormProps {
  onSubmit: (job: Omit<Job, "id">) => void
  initialData?: Omit<Job, "id">
}

const jobStatuses = ["Applied", "Interviewing", "Offer", "Rejected"]
const jobIndustries = ["Technology", "Healthcare", "Finance", "Education", "Marketing", "Design", "Retail"]
const jobTypes = ["Full-time", "Part-time", "Contract", "Internship"]

export function JobForm({ onSubmit, initialData }: JobFormProps) {
  const [company, setCompany] = useState(initialData?.company || "")
  const [position, setPosition] = useState(initialData?.position || "")
  const [dateApplied, setDateApplied] = useState(initialData?.dateApplied || "")
  const [status, setStatus] = useState<Job["status"]>(initialData?.status || "Applied")
  const [industry, setIndustry] = useState(initialData?.industry || "")
  const [estimatedSalary, setEstimatedSalary] = useState(initialData?.estimatedSalary || "")
  const [jobType, setJobType] = useState<Job["jobType"]>(initialData?.jobType || "Full-time")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Get company logo asynchronously
    const companyLogo = getCompanyLogo(company)
    
    onSubmit({
      company,
      position,
      dateApplied,
      status,
      industry,
      estimatedSalary: estimatedSalary ? Number(estimatedSalary) : undefined,
      jobType,
      companyLogo,
    })
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
      <Button type="submit" className="w-full">
        {initialData ? "Update Application" : "Add Application"}
      </Button>
    </form>
  )
}
