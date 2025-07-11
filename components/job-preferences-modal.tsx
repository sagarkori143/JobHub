"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { X, Plus, Bell, Mail, MessageSquare, Smartphone } from "lucide-react"

interface JobPreferencesModalProps {
  isOpen: boolean
  onClose: () => void
}

const availableIndustries = ["Technology", "Healthcare", "Finance", "Education", "Marketing", "Design"]
const availableJobTypes = ["Full-time", "Part-time", "Contract", "Internship"]
const availableExperienceLevels = ["Entry", "Mid", "Senior", "Executive"]

export function JobPreferencesModal({ isOpen, onClose }: JobPreferencesModalProps) {
  const { jobPreferences, updateJobPreferences } = useAuth()
  const { toast } = useToast()

  const [localPreferences, setLocalPreferences] = useState(jobPreferences)
  const [newKeyword, setNewKeyword] = useState("")
  const [newLocation, setNewLocation] = useState("")

  const handleSave = () => {
    updateJobPreferences(localPreferences)
    toast({
      title: "Preferences Updated!",
      description: "Your job preferences have been saved. You'll receive notifications for matching jobs.",
    })
    onClose()
  }

  const addKeyword = () => {
    if (newKeyword.trim() && !localPreferences.keywords.includes(newKeyword.trim())) {
      setLocalPreferences({
        ...localPreferences,
        keywords: [...localPreferences.keywords, newKeyword.trim()],
      })
      setNewKeyword("")
    }
  }

  const removeKeyword = (keyword: string) => {
    setLocalPreferences({
      ...localPreferences,
      keywords: localPreferences.keywords.filter((k) => k !== keyword),
    })
  }

  const addLocation = () => {
    if (newLocation.trim() && !localPreferences.locations.includes(newLocation.trim())) {
      setLocalPreferences({
        ...localPreferences,
        locations: [...localPreferences.locations, newLocation.trim()],
      })
      setNewLocation("")
    }
  }

  const removeLocation = (location: string) => {
    setLocalPreferences({
      ...localPreferences,
      locations: localPreferences.locations.filter((l) => l !== location),
    })
  }

  const handleArrayChange = (key: keyof typeof localPreferences, value: string, checked: boolean) => {
    const currentArray = localPreferences[key] as string[]
    const newArray = checked ? [...currentArray, value] : currentArray.filter((item) => item !== value)

    setLocalPreferences({
      ...localPreferences,
      [key]: newArray,
    })
  }

  const handleNotificationChange = (type: keyof typeof localPreferences.notifications, checked: boolean) => {
    setLocalPreferences({
      ...localPreferences,
      notifications: {
        ...localPreferences.notifications,
        [type]: checked,
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <span>Job Notification Preferences</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Keywords Section */}
          <div>
            <Label className="text-base font-semibold">Keywords & Skills</Label>
            <p className="text-sm text-gray-600 mb-3">Add keywords to get notified about relevant jobs</p>

            <div className="flex space-x-2 mb-3">
              <Input
                placeholder="e.g., React, Python, Marketing"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addKeyword()}
              />
              <Button onClick={addKeyword} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {localPreferences.keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="bg-blue-100 text-blue-800">
                  {keyword}
                  <button onClick={() => removeKeyword(keyword)} className="ml-1 hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Industries */}
          <div>
            <Label className="text-base font-semibold">Industries</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {availableIndustries.map((industry) => (
                <div key={industry} className="flex items-center space-x-2">
                  <Checkbox
                    id={industry}
                    checked={localPreferences.industries.includes(industry)}
                    onCheckedChange={(checked) => handleArrayChange("industries", industry, checked as boolean)}
                  />
                  <Label htmlFor={industry}>{industry}</Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Locations */}
          <div>
            <Label className="text-base font-semibold">Preferred Locations</Label>
            <p className="text-sm text-gray-600 mb-3">Add cities or "Remote" for remote work</p>

            <div className="flex space-x-2 mb-3">
              <Input
                placeholder="e.g., San Francisco, Remote, New York"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addLocation()}
              />
              <Button onClick={addLocation} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {localPreferences.locations.map((location) => (
                <Badge key={location} variant="secondary" className="bg-green-100 text-green-800">
                  {location}
                  <button onClick={() => removeLocation(location)} className="ml-1 hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Job Types */}
          <div>
            <Label className="text-base font-semibold">Job Types</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {availableJobTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={localPreferences.jobTypes.includes(type)}
                    onCheckedChange={(checked) => handleArrayChange("jobTypes", type, checked as boolean)}
                  />
                  <Label htmlFor={type}>{type}</Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Experience Levels */}
          <div>
            <Label className="text-base font-semibold">Experience Levels</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {availableExperienceLevels.map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={level}
                    checked={localPreferences.experienceLevels.includes(level)}
                    onCheckedChange={(checked) => handleArrayChange("experienceLevels", level, checked as boolean)}
                  />
                  <Label htmlFor={level}>{level}</Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Salary Range */}
          <div>
            <Label className="text-base font-semibold">
              Salary Range: ${localPreferences.salaryRange.min.toLocaleString()} - $
              {localPreferences.salaryRange.max.toLocaleString()}
            </Label>
            <div className="mt-4 space-y-4">
              <div>
                <Label className="text-sm">Minimum Salary</Label>
                <Slider
                  value={[localPreferences.salaryRange.min]}
                  onValueChange={([value]) =>
                    setLocalPreferences({
                      ...localPreferences,
                      salaryRange: { ...localPreferences.salaryRange, min: value },
                    })
                  }
                  max={200000}
                  step={5000}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Maximum Salary</Label>
                <Slider
                  value={[localPreferences.salaryRange.max]}
                  onValueChange={([value]) =>
                    setLocalPreferences({
                      ...localPreferences,
                      salaryRange: { ...localPreferences.salaryRange, max: value },
                    })
                  }
                  max={200000}
                  step={5000}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Notification Methods */}
          <div>
            <Label className="text-base font-semibold">Notification Methods</Label>
            <p className="text-sm text-gray-600 mb-4">Choose how you want to receive job alerts</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-600">Get job alerts via email</p>
                  </div>
                </div>
                <Checkbox
                  checked={localPreferences.notifications.email}
                  onCheckedChange={(checked) => handleNotificationChange("email", checked as boolean)}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-500">SMS Notifications</p>
                    <p className="text-sm text-gray-400">Get job alerts via SMS</p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      Coming Soon
                    </Badge>
                  </div>
                </div>
                <Checkbox disabled checked={false} />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-500">WhatsApp Notifications</p>
                    <p className="text-sm text-gray-400">Get job alerts via WhatsApp</p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      Coming Soon
                    </Badge>
                  </div>
                </div>
                <Checkbox disabled checked={false} />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Save Preferences
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
