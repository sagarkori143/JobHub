"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { JobSearchFilters } from "@/types/job-search"

interface JobFiltersProps {
  filters: JobSearchFilters
  setFilters: (filters: JobSearchFilters) => void
}

export function JobFilters({ filters, setFilters }: JobFiltersProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFilters({ ...filters, [id]: value })
  }

  const handleSelectChange = (id: keyof JobSearchFilters, value: string) => {
    setFilters({ ...filters, [id]: value })
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFilters({ ...filters, remote: checked })
  }

  const handleClearFilters = () => {
    setFilters({
      keywords: "",
      location: "",
      type: "",
      experienceLevel: "",
      salaryMin: "",
      remote: false,
    })
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Filter Jobs</h2>

      <div>
        <Label htmlFor="keywords" className="mb-2 block">
          Keywords
        </Label>
        <Input
          id="keywords"
          placeholder="e.g., React, Frontend, Senior"
          value={filters.keywords}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <Label htmlFor="location" className="mb-2 block">
          Location
        </Label>
        <Input
          id="location"
          placeholder="e.g., New York, Remote"
          value={filters.location}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <Label htmlFor="type" className="mb-2 block">
          Job Type
        </Label>
        <Select value={filters.type} onValueChange={(value) => handleSelectChange("type", value)}>
          <SelectTrigger id="type">
            <SelectValue placeholder="Select job type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Full-time">Full-time</SelectItem>
            <SelectItem value="Part-time">Part-time</SelectItem>
            <SelectItem value="Contract">Contract</SelectItem>
            <SelectItem value="Internship">Internship</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="experienceLevel" className="mb-2 block">
          Experience Level
        </Label>
        <Select value={filters.experienceLevel} onValueChange={(value) => handleSelectChange("experienceLevel", value)}>
          <SelectTrigger id="experienceLevel">
            <SelectValue placeholder="Select experience level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Entry">Entry Level</SelectItem>
            <SelectItem value="Mid">Mid Level</SelectItem>
            <SelectItem value="Senior">Senior Level</SelectItem>
            <SelectItem value="Director">Director</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="salaryMin" className="mb-2 block">
          Minimum Salary
        </Label>
        <Input
          id="salaryMin"
          type="number"
          placeholder="e.g., 70000"
          value={filters.salaryMin}
          onChange={handleInputChange}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="remote" checked={filters.remote} onCheckedChange={handleCheckboxChange} />
        <Label htmlFor="remote">Remote Only</Label>
      </div>

      <Button onClick={handleClearFilters} variant="outline" className="w-full bg-transparent">
        Clear Filters
      </Button>
    </div>
  )
}
