"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, DollarSign, Clock, Building, FileText } from "lucide-react"
import type { JobListing } from "@/types/job-search"
import type { Job } from "@/types/job"

interface JobDetailsModalProps {
  job: JobListing | null
  isOpen: boolean
  onClose: () => void
  onAddToPersonal: (job: Omit<Job, "id">) => void
  onApply: (job: JobListing) => void
}

export function JobDetailsModal({ job, isOpen, onClose, onAddToPersonal, onApply }: JobDetailsModalProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [matchScore, setMatchScore] = useState<number | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  if (!job) return null

  const formatSalary = (min: number, max: number, currency: string) => {
    return `$${min.toLocaleString()} - $${max.toLocaleString()} ${currency}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setResumeFile(file)
      setMatchScore(null)
    }
  }

  const analyzeResume = async () => {
    if (!resumeFile) return

    setIsAnalyzing(true)
    // Simulate API call for resume analysis
    setTimeout(() => {
      // Mock score between 60-95
      const score = Math.floor(Math.random() * 35) + 60
      setMatchScore(score)
      setIsAnalyzing(false)
    }, 2000)
  }

  const handleAddToPersonal = () => {
    const personalJob: Omit<Job, "id"> = {
      company: job.company,
      position: job.title,
      dateApplied: new Date().toISOString().split("T")[0],
      status: "Applied",
      industry: job.industry,
      estimatedSalary: Math.floor((job.salary.min + job.salary.max) / 2),
    }
    onAddToPersonal(personalJob)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-lg p-1">
          <div className="bg-white rounded-lg p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{job.title}</h2>
                  <p className="text-lg text-gray-600">{job.company}</p>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Job Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{job.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{formatSalary(job.salary.min, job.salary.max, job.salary.currency)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Posted {formatDate(job.postedDate)}</span>
                </div>
                <div className="flex space-x-2">
                  <Badge>{job.type}</Badge>
                  {job.remote && <Badge variant="outline">Remote</Badge>}
                </div>
              </div>

              <Separator />

              {/* Job Description */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Job Description</h3>
                <p className="text-gray-700 leading-relaxed">{job.description}</p>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Benefits</h3>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Resume Upload and Analysis */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Resume Analysis</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="resume">Upload Resume (PDF)</Label>
                    <Input id="resume" type="file" accept=".pdf" onChange={handleResumeUpload} className="mt-1" />
                  </div>

                  {resumeFile && (
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">{resumeFile.name}</span>
                      <Button size="sm" onClick={analyzeResume} disabled={isAnalyzing}>
                        {isAnalyzing ? "Analyzing..." : "Analyze Match"}
                      </Button>
                    </div>
                  )}

                  {matchScore !== null && (
                    <div className="bg-white p-3 rounded border">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">ATS Match Score:</span>
                        <span
                          className={`text-lg font-bold ${
                            matchScore >= 80 ? "text-green-600" : matchScore >= 60 ? "text-yellow-600" : "text-red-600"
                          }`}
                        >
                          {matchScore}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className={`h-2 rounded-full ${
                            matchScore >= 80 ? "bg-green-600" : matchScore >= 60 ? "bg-yellow-600" : "bg-red-600"
                          }`}
                          style={{ width: `${matchScore}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  onClick={() => onApply(job)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                >
                  Apply for this Job
                </Button>
                <Button
                  onClick={handleAddToPersonal}
                  variant="outline"
                  className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent"
                >
                  Add to Personal Dashboard
                </Button>
                <Button variant="ghost" onClick={onClose} className="hover:bg-gray-100">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
