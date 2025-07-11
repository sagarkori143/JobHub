"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
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

  const handleFilterChange = (key: keyof JobFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleArrayFilterChange = (key: keyof JobFilters, value: string, checked: boolean) => {
    const currentArray = localFilters[key] as string[]
    const newArray = checked ? [...currentArray, value] : currentArray.filter((item) => item !== value)

    handleFilterChange(key, newArray)
  }

  const clearFilters = () => {
    const clearedFilters: JobFilters = {
      search: "",
      location: "",
      jobType: [],
      experienceLevel: [],
      industry: [],
      remote: null,
      salaryRange: { min: 0, max: 200000 },
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
          <div className="space-y-2 mt-2">
            {jobTypesArray.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={localFilters.jobType.includes(type)}
                  onCheckedChange={(checked) => handleArrayFilterChange("jobType", type, checked as boolean)}
                />
                <Label htmlFor={type}>{type}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Experience Level</Label>
          <div className="space-y-2 mt-2">
            {experienceLevelsArray.map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <Checkbox
                  id={level}
                  checked={localFilters.experienceLevel.includes(level)}
                  onCheckedChange={(checked) => handleArrayFilterChange("experienceLevel", level, checked as boolean)}
                />
                <Label htmlFor={level}>{level}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Industry</Label>
          <div className="space-y-2 mt-2">
            {industriesArray.map((industry) => (
              <div key={industry} className="flex items-center space-x-2">
                <Checkbox
                  id={industry}
                  checked={localFilters.industry.includes(industry)}
                  onCheckedChange={(checked) => handleArrayFilterChange("industry", industry, checked as boolean)}
                />
                <Label htmlFor={industry}>{industry}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Remote Work</Label>
          <Select
            value={localFilters.remote === null ? "any" : localFilters.remote.toString()}
            onValueChange={(value) => handleFilterChange("remote", value === "any" ? null : value === "true")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="true">Remote Only</SelectItem>
              <SelectItem value="false">On-site Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>
            Salary Range: ${localFilters.salaryRange.min.toLocaleString()} - $
            {localFilters.salaryRange.max.toLocaleString()}
          </Label>
          <div className="mt-2 space-y-4">
            <div>
              <Label className="text-sm">Minimum</Label>
              <Slider
                value={[localFilters.salaryRange.min]}
                onValueChange={([value]) =>
                  handleFilterChange("salaryRange", { ...localFilters.salaryRange, min: value })
                }
                max={200000}
                step={5000}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">Maximum</Label>
              <Slider
                value={[localFilters.salaryRange.max]}
                onValueChange={([value]) =>
                  handleFilterChange("salaryRange", { ...localFilters.salaryRange, max: value })
                }
                max={200000}
                step={5000}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
