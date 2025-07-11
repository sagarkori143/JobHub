"use client"

import { useState, useMemo, useEffect } from "react"
import { JobListingCard } from "@/components/job-listing-card"
import { JobFilters } from "@/components/job-filters"
import { JobDetailsModal } from "@/components/job-details-modal"
import { Pagination } from "@/components/pagination"
import { mockJobs } from "@/data/mock-jobs"
import { useToast } from "@/hooks/use-toast"
import type { JobListing, JobFilters as JobFiltersType } from "@/types/job-search"
import type { Job } from "@/types/job"
import { jobIntegrationService } from "@/services/job-integration-service"

const initialFilters: JobFiltersType = {
  search: "",
  location: "",
  jobType: [],
  experienceLevel: [],
  industry: [],
  remote: null,
  salaryRange: { min: 0, max: 200000 },
}

const JOBS_PER_PAGE = 6

export default function JobSearchPage() {
  const [filters, setFilters] = useState<JobFiltersType>(initialFilters)
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [allJobs, setAllJobs] = useState<JobListing[]>([])
  const { toast } = useToast()

  // Load jobs on component mount
  useEffect(() => {
    // Load scraped jobs and integrate with existing jobs
    jobIntegrationService.loadScrapedJobs()
    const integratedJobs = jobIntegrationService.getAllJobs(mockJobs)
    setAllJobs(integratedJobs)
  }, [])

  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      // Search filter
      if (
        filters.search &&
        !job.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !job.company.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false
      }

      // Location filter
      if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false
      }

      // Job type filter
      if (filters.jobType.length > 0 && !filters.jobType.includes(job.type)) {
        return false
      }

      // Experience level filter
      if (filters.experienceLevel.length > 0 && !filters.experienceLevel.includes(job.experienceLevel)) {
        return false
      }

      // Industry filter
      if (filters.industry.length > 0 && !filters.industry.includes(job.industry)) {
        return false
      }

      // Remote filter
      if (filters.remote !== null && job.remote !== filters.remote) {
        return false
      }

      // Salary range filter
      const avgSalary = (job.salary.min + job.salary.max) / 2
      if (avgSalary < filters.salaryRange.min || avgSalary > filters.salaryRange.max) {
        return false
      }

      return true
    })
  }, [filters, allJobs])

  // Pagination logic
  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE)
  const startIndex = (currentPage - 1) * JOBS_PER_PAGE
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + JOBS_PER_PAGE)

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [filters])

  const handleViewDetails = (job: JobListing) => {
    setSelectedJob(job)
    setIsModalOpen(true)
  }

  const handleApply = (job: JobListing) => {
    toast({
      title: "Application Submitted!",
      description: `Your application for ${job.title} at ${job.company} has been submitted successfully.`,
      duration: 5000,
    })
  }

  const handleAddToPersonal = (job: Omit<Job, "id">) => {
    // In a real app, this would save to a database or state management
    console.log("Adding job to personal dashboard:", job)
    toast({
      title: "Job Added!",
      description: "Job has been added to your personal dashboard.",
      duration: 3000,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30">
      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <div className="w-80 flex-shrink-0">
          <div className="sticky top-6">
            <JobFilters filters={filters} onFiltersChange={setFilters} />
          </div>
        </div>

        {/* Job Listings */}
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Find Your Dream Job
            </h1>
            <p className="text-gray-600 text-lg">
              {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""} found
              {currentPage > 1 && ` • Page ${currentPage} of ${totalPages}`}
            </p>
          </div>

          <div className="space-y-6">
            {paginatedJobs.map((job) => (
              <JobListingCard key={job.id} job={job} onViewDetails={handleViewDetails} onApply={handleApply} />
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🔍</span>
              </div>
              <p className="text-gray-500 text-xl mb-2">No jobs found matching your criteria</p>
              <p className="text-gray-400">Try adjusting your filters to see more results</p>
            </div>
          )}

          {/* Pagination */}
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>

        {/* Job Details Modal */}
        <JobDetailsModal
          job={selectedJob}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddToPersonal={handleAddToPersonal}
          onApply={handleApply}
        />
      </div>
    </div>
  )
}
