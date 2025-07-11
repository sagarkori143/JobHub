"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Building, MapPin, DollarSign, Clock, FileText, Sparkles } from "lucide-react"
import type { JobListing } from "@/types/job-search"
import type { Job } from "@/types/job"
import { getCompanyLogo } from "@/lib/company-logos"

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
  const router = useRouter()

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

  const handleResumeMatching = () => {
    // Navigate to resume scoring page with job description pre-filled
    const encodedDescription = encodeURIComponent(job.description)
    router.push(`/resume-scoring?jobDescription=${encodedDescription}`)
    onClose() // Close the modal
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

  const companyLogo = getCompanyLogo(job.company)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[95vh] overflow-y-auto">
        {" "}
        {/* Made responsive */}
        <div className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-lg p-1">
          <div className="bg-white rounded-lg p-4 md:p-6">
            {" "}
            {/* Adjusted responsive padding */}
            <DialogHeader>
              <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden bg-white shadow-sm">
                  {" "}
                  {/* Adjusted size */}
                  <img 
                    src={companyLogo} 
                    alt={`${job.company} logo`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback to building icon if image fails to load
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                  <Building className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 hidden" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">{job.title}</h2> {/* Adjusted font size */}
                  <p className="text-base sm:text-lg text-gray-600">{job.company}</p> {/* Adjusted font size */}
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              {" "}
              {/* Added margin-top */}
              {/* Job Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {" "}
                {/* Made responsive */}
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
                <p className="text-gray-700 leading-relaxed text-sm">{job.description}</p> {/* Adjusted font size */}
              </div>
              {/* Requirements */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                <ul className="space-y-2">
                  {job.requirements.map((req: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700 text-sm">{req}</span> {/* Adjusted font size */}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Benefits */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Benefits</h3>
                <ul className="space-y-2">
                  {job.benefits.map((benefit: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700 text-sm">{benefit}</span> {/* Adjusted font size */}
                    </li>
                  ))}
                </ul>
              </div>
              <Separator />
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                {" "}
                {/* Made responsive */}
                <Button
                  onClick={() => onApply(job)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                >
                  Apply for this Job
                </Button>
                <Button
                  onClick={handleResumeMatching}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg"
                >
                  Resume Matching
                </Button>
                <Button
                  onClick={handleAddToPersonal}
                  variant="outline"
                  className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent"
                >
                  Add to Personal Dashboard
                </Button>
                <Button variant="ghost" onClick={onClose} className="flex-1 hover:bg-gray-100">
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
