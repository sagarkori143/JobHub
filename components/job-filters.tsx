"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { JobSearchCriteria } from "@/types/job-search"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

interface JobFiltersProps {
  onFilterChange: (filters: JobSearchCriteria) => void
  currentFilters: JobSearchCriteria
}

export function JobFilters({ onFilterChange, currentFilters }: JobFiltersProps) {
  const [filters, setFilters] = useState<JobSearchCriteria>(currentFilters)

  useEffect(() => {
    setFilters(currentFilters)
  }, [currentFilters])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFilters((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: keyof JobSearchCriteria, value: string) => {
    setFilters((prev) => ({ ...prev, [id]: value }))
  }

  const handleCheckboxChange = (id: keyof JobSearchCriteria, value: string, checked: boolean) => {
    setFilters((prev) => {
      const currentArray = (prev[id] || []) as string[]
      if (checked) {
        return { ...prev, [id]: [...currentArray, value] }
      } else {
        return { ...prev, [id]: currentArray.filter((item) => item !== value) }
      }
    })
  }

  const handleApplyFilters = () => {
    onFilterChange(filters)
  }

  const handleClearFilters = () => {
    const clearedFilters: JobSearchCriteria = {
      keywords: "",
      location: "",
      jobType: [],
      experienceLevel: [],
      salaryMin: undefined,
      salaryMax: undefined,
      company: "",
    }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  return (
    <div className="grid gap-4">
      <div>
        <Label htmlFor="keywords" className="mb-1 block">
          Keywords
        </Label>
        <Input
          id="keywords"
          value={filters.keywords || ""}
          onChange={handleChange}
          placeholder="e.g., React, Node.js"
        />
      </div>
      <div>
        <Label htmlFor="location" className="mb-1 block">
          Location
        </Label>
        <Input
          id="location"
          value={filters.location || ""}
          onChange={handleChange}
          placeholder="e.g., New York, Remote"
        />
      </div>
      <div>
        <Label className="mb-1 block">Job Type</Label>
        <div className="grid grid-cols-2 gap-2">
          {["Full-time", "Part-time", "Contract", "Temporary", "Internship"].map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`jobType-${type}`}
                checked={filters.jobType?.includes(type as any) || false}
                onCheckedChange={(checked) => handleCheckboxChange("jobType", type, checked as boolean)}
              />
              <Label htmlFor={`jobType-${type}`}>{type}</Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label className="mb-1 block">Experience Level</Label>
        <div className="grid grid-cols-2 gap-2">
          {["Entry-level", "Associate", "Mid-senior", "Director", "Executive"].map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <Checkbox
                id={`experienceLevel-${level}`}
                checked={filters.experienceLevel?.includes(level as any) || false}
                onCheckedChange={(checked) => handleCheckboxChange("experienceLevel", level, checked as boolean)}
              />
              <Label htmlFor={`experienceLevel-${level}`}>{level}</Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="salaryMin" className="mb-1 block">
          Minimum Salary
        </Label>
        <Input
          id="salaryMin"
          type="number"
          value={filters.salaryMin || ""}
          onChange={handleChange}
          placeholder="e.g., 50000"
        />
      </div>
      <div>
        <Label htmlFor="salaryMax" className="mb-1 block">
          Maximum Salary
        </Label>
        <Input
          id="salaryMax"
          type="number"
          value={filters.salaryMax || ""}
          onChange={handleChange}
          placeholder="e.g., 100000"
        />
      </div>
      <div>
        <Label htmlFor="company" className="mb-1 block">
          Company
        </Label>
        <Input id="company" value={filters.company || ""} onChange={handleChange} placeholder="e.g., Google" />
      </div>
      <div className="flex gap-2 mt-4">
        <Button onClick={handleApplyFilters} className="flex-1">
          Apply Filters
        </Button>
        <Button variant="outline" onClick={handleClearFilters} className="flex-1 bg-transparent">
          Clear Filters
        </Button>
      </div>
    </div>
  )
}
