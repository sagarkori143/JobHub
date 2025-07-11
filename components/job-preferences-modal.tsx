"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

interface JobPreferencesModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Preferences {
  jobTypes: string[]
  experienceLevels: string[]
  remoteOnly: boolean
  preferredLocations: string
  minSalary: number | ""
}

const allJobTypes = ["Full-time", "Part-time", "Contract", "Internship"]
const allExperienceLevels = ["Entry", "Mid", "Senior", "Director"]

export function JobPreferencesModal({ isOpen, onClose }: JobPreferencesModalProps) {
  const [preferences, setPreferences] = useState<Preferences>({
    jobTypes: [],
    experienceLevels: [],
    remoteOnly: false,
    preferredLocations: "",
    minSalary: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    // Load preferences from local storage
    const storedPreferences = localStorage.getItem("jobPreferences")
    if (storedPreferences) {
      setPreferences(JSON.parse(storedPreferences))
    }
  }, [])

  const handleJobTypeChange = (type: string, checked: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      jobTypes: checked ? [...prev.jobTypes, type] : prev.jobTypes.filter((t) => t !== type),
    }))
  }

  const handleExperienceLevelChange = (level: string, checked: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      experienceLevels: checked ? [...prev.experienceLevels, level] : prev.experienceLevels.filter((l) => l !== level),
    }))
  }

  const handleRemoteOnlyChange = (checked: boolean) => {
    setPreferences((prev) => ({ ...prev, remoteOnly: checked }))
  }

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences((prev) => ({ ...prev, preferredLocations: e.target.value }))
  }

  const handleMinSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPreferences((prev) => ({
      ...prev,
      minSalary: value === "" ? "" : Number(value),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem("jobPreferences", JSON.stringify(preferences))
    toast({
      title: "Preferences Saved",
      description: "Your job preferences have been updated.",
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Job Preferences</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div>
            <Label className="text-base font-medium mb-2 block">Job Types</Label>
            <div className="grid grid-cols-2 gap-2">
              {allJobTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`job-type-${type}`}
                    checked={preferences.jobTypes.includes(type)}
                    onCheckedChange={(checked) => handleJobTypeChange(type, checked as boolean)}
                  />
                  <Label htmlFor={`job-type-${type}`}>{type}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base font-medium mb-2 block">Experience Levels</Label>
            <div className="grid grid-cols-2 gap-2">
              {allExperienceLevels.map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={`exp-level-${level}`}
                    checked={preferences.experienceLevels.includes(level)}
                    onCheckedChange={(checked) => handleExperienceLevelChange(level, checked as boolean)}
                  />
                  <Label htmlFor={`exp-level-${level}`}>{level} Level</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remote-only"
              checked={preferences.remoteOnly}
              onCheckedChange={(checked) => handleRemoteOnlyChange(checked as boolean)}
            />
            <Label htmlFor="remote-only">Remote Only</Label>
          </div>

          <div>
            <Label htmlFor="preferred-locations" className="mb-2 block">
              Preferred Locations (comma-separated)
            </Label>
            <Input
              id="preferred-locations"
              value={preferences.preferredLocations}
              onChange={handleLocationChange}
              placeholder="e.g., New York, London, Remote"
            />
          </div>

          <div>
            <Label htmlFor="min-salary" className="mb-2 block">
              Minimum Salary (USD)
            </Label>
            <Input
              id="min-salary"
              type="number"
              value={preferences.minSalary}
              onChange={handleMinSalaryChange}
              placeholder="e.g., 70000"
            />
          </div>

          <DialogFooter>
            <Button type="submit">Save Preferences</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
