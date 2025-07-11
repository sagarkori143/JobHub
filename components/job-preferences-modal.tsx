"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"

interface JobPreferences {
  preferredLocations: string[]
  preferredJobTypes: string[]
  preferredExperienceLevels: string[]
  minSalary: number
  keywords: string
  notificationFrequency: "daily" | "weekly" | "monthly" | "none"
}

interface JobPreferencesModalProps {
  isOpen: boolean
  onClose: () => void
}

export function JobPreferencesModal({ isOpen, onClose }: JobPreferencesModalProps) {
  const [preferences, setPreferences] = useState<JobPreferences>({
    preferredLocations: [],
    preferredJobTypes: [],
    preferredExperienceLevels: [],
    minSalary: 0,
    keywords: "",
    notificationFrequency: "daily",
  })
  const [newLocation, setNewLocation] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Simulate fetching existing preferences
    const fetchPreferences = async () => {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API call
      const storedPreferences = localStorage.getItem("jobPreferences")
      if (storedPreferences) {
        setPreferences(JSON.parse(storedPreferences))
      }
      setLoading(false)
    }
    if (isOpen) {
      fetchPreferences()
    }
  }, [isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setPreferences((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: keyof JobPreferences, value: string) => {
    setPreferences((prev) => ({ ...prev, [id]: value as any }))
  }

  const handleAddLocation = () => {
    if (newLocation.trim() && !preferences.preferredLocations.includes(newLocation.trim())) {
      setPreferences((prev) => ({
        ...prev,
        preferredLocations: [...prev.preferredLocations, newLocation.trim()],
      }))
      setNewLocation("")
    }
  }

  const handleRemoveLocation = (locationToRemove: string) => {
    setPreferences((prev) => ({
      ...prev,
      preferredLocations: prev.preferredLocations.filter((loc) => loc !== locationToRemove),
    }))
  }

  const handleCheckboxChange = (field: keyof JobPreferences, value: string, checked: boolean) => {
    setPreferences((prev) => {
      const currentArray = (prev[field] || []) as string[]
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] }
      } else {
        return { ...prev, [field]: currentArray.filter((item) => item !== value) }
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
      localStorage.setItem("jobPreferences", JSON.stringify(preferences))
      toast({
        title: "Preferences Saved!",
        description: "Your job preferences have been updated.",
      })
      onClose()
    } catch (error) {
      console.error("Failed to save preferences:", error)
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Job Preferences</DialogTitle>
          <DialogDescription>Set your preferences for job alerts and recommendations.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="keywords" className="text-right">
              Keywords
            </Label>
            <Input
              id="keywords"
              value={preferences.keywords}
              onChange={handleChange}
              placeholder="e.g., React, AI, Backend"
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="preferredLocations" className="text-right">
              Locations
            </Label>
            <div className="col-span-3 flex flex-col gap-2">
              {preferences.preferredLocations.map((loc, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={loc} disabled className="flex-1" />
                  <Button type="button" variant="outline" onClick={() => handleRemoveLocation(loc)}>
                    Remove
                  </Button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Add a preferred location"
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddLocation}>
                  Add
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Preferred Job Types</Label>
            <div className="grid grid-cols-2 gap-2">
              {["Full-time", "Part-time", "Contract", "Temporary", "Internship"].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`jobType-${type}`}
                    checked={preferences.preferredJobTypes.includes(type)}
                    onCheckedChange={(checked) => handleCheckboxChange("preferredJobTypes", type, checked as boolean)}
                  />
                  <Label htmlFor={`jobType-${type}`}>{type}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Preferred Experience Levels</Label>
            <div className="grid grid-cols-2 gap-2">
              {["Entry-level", "Associate", "Mid-senior", "Director", "Executive"].map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={`expLevel-${level}`}
                    checked={preferences.preferredExperienceLevels.includes(level)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("preferredExperienceLevels", level, checked as boolean)
                    }
                  />
                  <Label htmlFor={`expLevel-${level}`}>{level}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="minSalary" className="text-right">
              Minimum Salary
            </Label>
            <Input
              id="minSalary"
              type="number"
              value={preferences.minSalary}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notificationFrequency" className="text-right">
              Notification Frequency
            </Label>
            <Select
              onValueChange={(value) => handleSelectChange("notificationFrequency", value)}
              value={preferences.notificationFrequency}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
