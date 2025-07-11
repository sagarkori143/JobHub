"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import type { Job } from "@/types/job"
import { jobDataService } from "@/services/job-data-service"
import { toast } from "@/hooks/use-toast"

interface JobEditFormProps {
  job: Job
  onJobUpdated: (job: Job) => void
  onClose: () => void
}

export function JobEditForm({ job: initialJob, onJobUpdated, onClose }: JobEditFormProps) {
  const [job, setJob] = useState<Job>(initialJob)
  const [newSkill, setNewSkill] = useState("")
  const [newRequirement, setNewRequirement] = useState("")
  const [newResponsibility, setNewResponsibility] = useState("")

  useEffect(() => {
    setJob(initialJob)
  }, [initialJob])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setJob((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: keyof Job, value: string) => {
    setJob((prev) => ({ ...prev, [id]: value }))
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setJob((prev) => ({ ...prev, datePosted: format(date, "yyyy-MM-dd") }))
    }
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !job.skills.includes(newSkill.trim())) {
      setJob((prev) => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }))
      setNewSkill("")
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setJob((prev) => ({ ...prev, skills: prev.skills.filter((skill) => skill !== skillToRemove) }))
  }

  const handleAddRequirement = () => {
    if (newRequirement.trim() && !job.requirements.includes(newRequirement.trim())) {
      setJob((prev) => ({ ...prev, requirements: [...prev.requirements, newRequirement.trim()] }))
      setNewRequirement("")
    }
  }

  const handleRemoveRequirement = (reqToRemove: string) => {
    setJob((prev) => ({ ...prev, requirements: prev.requirements.filter((req) => req !== reqToRemove) }))
  }

  const handleAddResponsibility = () => {
    if (newResponsibility.trim() && !job.responsibilities.includes(newResponsibility.trim())) {
      setJob((prev) => ({ ...prev, responsibilities: [...prev.responsibilities, newResponsibility.trim()] }))
      setNewResponsibility("")
    }
  }

  const handleRemoveResponsibility = (respToRemove: string) => {
    setJob((prev) => ({ ...prev, responsibilities: prev.responsibilities.filter((resp) => resp !== respToRemove) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const updatedJob = await jobDataService.updateJob(job.id, job)
      onJobUpdated(updatedJob)
      toast({
        title: "Job Updated!",
        description: `${updatedJob.title} at ${updatedJob.company} has been updated.`,
      })
      onClose()
    } catch (error) {
      console.error("Failed to update job:", error)
      toast({
        title: "Error",
        description: "Failed to update job. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="title" className="text-right">
          Title
        </Label>
        <Input id="title" value={job.title} onChange={handleChange} className="col-span-3" required />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="company" className="text-right">
          Company
        </Label>
        <Input id="company" value={job.company} onChange={handleChange} className="col-span-3" required />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="location" className="text-right">
          Location
        </Label>
        <Input id="location" value={job.location} onChange={handleChange} className="col-span-3" required />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="salary" className="text-right">
          Salary
        </Label>
        <Input id="salary" type="number" value={job.salary} onChange={handleChange} className="col-span-3" required />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="jobType" className="text-right">
          Job Type
        </Label>
        <Select onValueChange={(value) => handleSelectChange("jobType", value)} value={job.jobType} required>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select job type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Full-time">Full-time</SelectItem>
            <SelectItem value="Part-time">Part-time</SelectItem>
            <SelectItem value="Contract">Contract</SelectItem>
            <SelectItem value="Temporary">Temporary</SelectItem>
            <SelectItem value="Internship">Internship</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="experienceLevel" className="text-right">
          Experience
        </Label>
        <Select
          onValueChange={(value) => handleSelectChange("experienceLevel", value)}
          value={job.experienceLevel}
          required
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select experience level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Entry-level">Entry-level</SelectItem>
            <SelectItem value="Associate">Associate</SelectItem>
            <SelectItem value="Mid-senior">Mid-senior</SelectItem>
            <SelectItem value="Director">Director</SelectItem>
            <SelectItem value="Executive">Executive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="datePosted" className="text-right">
          Date Posted
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant={"outline"} className="col-span-3 justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {job.datePosted ? format(new Date(job.datePosted), "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={job.datePosted ? new Date(job.datePosted) : undefined}
              onSelect={handleDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="status" className="text-right">
          Status
        </Label>
        <Select onValueChange={(value) => handleSelectChange("status", value)} value={job.status} required>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Wishlist">Wishlist</SelectItem>
            <SelectItem value="Applied">Applied</SelectItem>
            <SelectItem value="Interviewing">Interviewing</SelectItem>
            <SelectItem value="Offers">Offers</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="applicationLink" className="text-right">
          Application Link
        </Label>
        <Input id="applicationLink" value={job.applicationLink || ""} onChange={handleChange} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="contactEmail" className="text-right">
          Contact Email
        </Label>
        <Input
          id="contactEmail"
          value={job.contactEmail || ""}
          onChange={handleChange}
          className="col-span-3"
          type="email"
        />
      </div>
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="description" className="text-right">
          Description
        </Label>
        <Textarea id="description" value={job.description} onChange={handleChange} className="col-span-3" required />
      </div>
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="requirements" className="text-right">
          Requirements
        </Label>
        <div className="col-span-3 flex flex-col gap-2">
          {job.requirements.map((req, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input value={req} disabled className="flex-1" />
              <Button type="button" variant="outline" onClick={() => handleRemoveRequirement(req)}>
                Remove
              </Button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <Input
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              placeholder="Add a requirement"
              className="flex-1"
            />
            <Button type="button" onClick={handleAddRequirement}>
              Add
            </Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="responsibilities" className="text-right">
          Responsibilities
        </Label>
        <div className="col-span-3 flex flex-col gap-2">
          {job.responsibilities.map((resp, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input value={resp} disabled className="flex-1" />
              <Button type="button" variant="outline" onClick={() => handleRemoveResponsibility(resp)}>
                Remove
              </Button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <Input
              value={newResponsibility}
              onChange={(e) => setNewResponsibility(e.target.value)}
              placeholder="Add a responsibility"
              className="flex-1"
            />
            <Button type="button" onClick={handleAddResponsibility}>
              Add
            </Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="skills" className="text-right">
          Skills
        </Label>
        <div className="col-span-3 flex flex-col gap-2">
          {job.skills.map((skill, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input value={skill} disabled className="flex-1" />
              <Button type="button" variant="outline" onClick={() => handleRemoveSkill(skill)}>
                Remove
              </Button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill"
              className="flex-1"
            />
            <Button type="button" onClick={handleAddSkill}>
              Add
            </Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="notes" className="text-right">
          Notes
        </Label>
        <Textarea id="notes" value={job.notes || ""} onChange={handleChange} className="col-span-3" />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  )
}
