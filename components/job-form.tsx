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

interface JobFormProps {
  onSubmit: (job: Omit<Job, "id">) => void
}

export function JobForm({ onSubmit }: JobFormProps) {
  const [company, setCompany] = useState("")
  const [position, setPosition] = useState("")
  const [industry, setIndustry] = useState("")
  const [status, setStatus] = useState<Job["status"]>("Applied")
  const [estimatedSalary, setEstimatedSalary] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const dateApplied = new Date().toISOString().split("T")[0]
    onSubmit({
      company,
      position,
      industry,
      status,
      dateApplied,
      estimatedSalary: estimatedSalary ? Number.parseInt(estimatedSalary) : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="company">Company</Label>
        <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="position">Position</Label>
        <Input id="position" value={position} onChange={(e) => setPosition(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="industry">Industry</Label>
        <Select value={industry} onValueChange={setIndustry}>
          <SelectTrigger>
            <SelectValue placeholder="Select an industry" />
          </SelectTrigger>
          <SelectContent>
            {industries.map((ind) => (
              <SelectItem key={ind} value={ind}>
                {ind}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={(value: Job["status"]) => setStatus(value)}>
          <SelectTrigger>
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
      <div>
        <Label htmlFor="estimatedSalary">Estimated Salary</Label>
        <Input
          id="estimatedSalary"
          type="number"
          value={estimatedSalary}
          onChange={(e) => setEstimatedSalary(e.target.value)}
        />
      </div>
      <Button type="submit">Add Job Application</Button>
    </form>
  )
}
