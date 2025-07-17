"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { JobFilters } from "@/types/job-search"

interface JobFiltersProps {
  filters: JobFilters
  onFiltersChange: (filters: JobFilters) => void
}

const jobTypesArray = ["Full-time", "Part-time", "Contract", "Internship"]
const experienceLevelsArray = ["Entry", "Mid", "Senior", "Executive"]
const industriesArray = ["Technology", "Healthcare", "Finance", "Education", "Marketing", "Design"]

// Rename component to match the import in app/page.tsx
export function JobFilters({ filters, onFiltersChange }: JobFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleFilterChange = (key: keyof JobFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters: JobFilters = {
      search: "",
      location: "",
      jobType: "all",
      experienceLevel: "all",
      industry: "all",
      remote: false,
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Filters
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="search">Search Jobs</Label>
          <Input
            id="search"
            placeholder="Job title, company, or keywords"
            value={localFilters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="City, state, or remote"
            value={localFilters.location}
            onChange={(e) => handleFilterChange("location", e.target.value)}
          />
        </div>

        <div>
          <Label>Job Type</Label>
          <Select
            value={localFilters.jobType}
            onValueChange={(value) => handleFilterChange("jobType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select job type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {jobTypesArray.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Experience Level</Label>
          <Select
            value={localFilters.experienceLevel}
            onValueChange={(value) => handleFilterChange("experienceLevel", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {experienceLevelsArray.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Industry</Label>
          <Select
            value={localFilters.industry}
            onValueChange={(value) => handleFilterChange("industry", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {industriesArray.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Remote Work</Label>
          <Select
            value={localFilters.remote ? "true" : "false"}
            onValueChange={(value) => handleFilterChange("remote", value === "true")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">On-site Only</SelectItem>
              <SelectItem value="true">Remote Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
