"use client"

import type { JobListing } from "@/types/job-search"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Briefcase, DollarSign, Calendar, Clock } from "lucide-react"

interface JobListingCardProps {
  job: JobListing
  onClick: () => void
}

export function JobListingCard({ job, onClick }: JobListingCardProps) {
  const formatSalary = (salary?: { min: number; max: number; currency: string }) => {
    if (!salary) return "N/A"
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: salary.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`
  }

  const getExperienceLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "entry":
        return "bg-blue-100 text-blue-800"
      case "mid":
        return "bg-green-100 text-green-800"
      case "senior":
        return "bg-purple-100 text-purple-800"
      case "director":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200 flex flex-col h-full"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-lg font-semibold">{job.title}</CardTitle>
          {job.companyLogo && (
            <img
              src={job.companyLogo || "/placeholder.svg"}
              alt={`${job.company} logo`}
              className="h-10 w-10 object-contain"
            />
          )}
        </div>
        <CardDescription className="text-gray-600">{job.company}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 text-sm text-gray-700 space-y-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span>{job.remote ? "Remote" : job.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-gray-500" />
          <span>{job.type}</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-gray-500" />
          <span>{formatSalary(job.salary)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>Posted: {job.postedDate}</span>
        </div>
        {job.applicationDeadline && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>Deadline: {job.applicationDeadline}</span>
          </div>
        )}
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge className={getExperienceLevelColor(job.experienceLevel)}>{job.experienceLevel} Level</Badge>
          <Badge variant="outline">{job.industry}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
