"use client"

import React from "react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, DollarSign, Building, ExternalLink } from "lucide-react"
import type { JobListing } from "@/types/job-search"
import { getCompanyLogo } from "@/lib/company-logos"

interface JobListingCardProps {
  job: JobListing
  onViewDetails: (job: JobListing) => void
  onApply: (job: JobListing) => void
}

const JobListingCardComponent = ({ job, onViewDetails, onApply }: JobListingCardProps) => {
  // Validate job object
  if (!job || typeof job !== 'object') {
    console.error('Invalid job object passed to JobListingCard:', job)
    return null
  }

  const formatSalary = (min: number, max: number, currency: string) => {
    try {
      // Validate salary data
      if (typeof min !== 'number' || typeof max !== 'number' || typeof currency !== 'string') {
        return "Not Sure"
      }

      // If min and max are the same or very close, show a fixed salary
      if (Math.abs(max - min) <= 1000) {
        return `$${(min / 1000).toFixed(0)}k ${currency}`
      }
      // If salary range is reasonable, show the range
      if (min > 0 && max > 0 && max > min) {
        return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k ${currency}`
      }
      // If no valid salary data, show "Not Sure"
      return "Not Sure"
    } catch (error) {
      console.error('Error formatting salary:', error)
      return "Not Sure"
    }
  }

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "Unknown"
      
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "Unknown"
      }
      
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) return "1 day ago"
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
      return `${Math.ceil(diffDays / 30)} months ago`
    } catch (error) {
      console.error('Error formatting date:', error)
      return "Unknown"
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    try {
      // Don't trigger card click if clicking on buttons
      if ((e.target as HTMLElement).closest("button")) {
        return
      }
      onViewDetails(job)
    } catch (error) {
      console.error('Error handling card click:', error)
    }
  }

  const companyLogo = getCompanyLogo(job.company || '')

  return (
    <Card
      className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-blue-500 bg-gradient-to-r from-white to-blue-50/30"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm overflow-hidden bg-white">
              <img 
                src={companyLogo} 
                alt={`${job.company || 'Company'} logo`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  try {
                    // Fallback to building icon if image fails to load
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const nextElement = target.nextElementSibling as HTMLElement
                    if (nextElement) {
                      nextElement.classList.remove('hidden')
                    }
                  } catch (error) {
                    console.error('Error handling image error:', error)
                  }
                }}
              />
              <Building className="w-6 h-6 text-blue-600 hidden" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-800">{job.title || 'Untitled Position'}</h3>
              <p className="text-gray-600 font-medium text-sm" title={job.company || 'Unknown Company'}>
                {job.company || 'Unknown Company'}
              </p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300"
          >
            {job.type || 'Full-time'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>{job.location || 'Location not specified'}</span>
            </div>
            {job.remote && (
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                Remote
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="font-medium">
                {job.salary ? formatSalary(job.salary.min, job.salary.max, job.salary.currency) : 'Salary not specified'}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>{formatDate(job.postedDate || '')}</span>
            </div>
          </div>

          <p className="text-sm text-gray-700 line-clamp-2">{job.description || 'No description available'}</p>

          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex space-x-2 flex-wrap">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {job.industry || 'Unknown Industry'}
              </Badge>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                {job.experienceLevel || 'Unknown Level'}
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  try {
                    e.stopPropagation()
                    onViewDetails(job)
                  } catch (error) {
                    console.error('Error handling view details:', error)
                  }
                }}
                className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 w-full sm:w-auto"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                View Details
              </Button>
              <Button
                size="sm"
                onClick={(e) => {
                  try {
                    e.stopPropagation()
                    onApply(job)
                  } catch (error) {
                    console.error('Error handling apply:', error)
                  }
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md w-full sm:w-auto"
              >
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export const JobListingCard = React.memo(JobListingCardComponent);
