"use client"

import { useState, useMemo, useEffect } from "react"
import { JobListingCard } from "@/components/job-listing-card"
import { JobFilters } from "@/components/job-filters"
import { JobDetailsModal } from "@/components/job-details-modal"
import { Pagination } from "@/components/pagination"
import { useToast } from "@/hooks/use-toast"
import { jobDataService } from "@/services/job-data-service"
import { getJobs } from "@/services/job-data-service"
import type { JobListing, JobFilters as JobFiltersType } from "@/types/job-search"
import type { Job } from "@/types/job"
import { RefreshCw, Database, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

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

export default async function JobSearchPage() {
  const jobs = await getJobs()
  const [filters, setFilters] = useState<JobFiltersType>(initialFilters)
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [allJobs, setAllJobs] = useState<JobListing[]>(jobs)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const { toast } = useToast()

  // Load jobs on component mount
  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    setIsLoading(true)
    try {
      const jobs = await jobDataService.loadJobs()
      setAllJobs(jobs)

      const metadata = jobDataService.getMetadata()
      setLastUpdated(metadata?.lastUpdated || null)

      console.log(`📊 Loaded ${jobs.length} jobs for display`)
    } catch (error) {
      console.error("Error loading jobs:", error)
      toast({
        title: "Error Loading Jobs",
        description: "Failed to load job data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

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
    console.log("Adding job to personal dashboard:", job)
    toast({
      title: "Job Added!",
      description: "Job has been added to your personal dashboard.",
      duration: 3000,
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <h2 className="text-xl font-semibold">Loading Jobs...</h2>
          <p className="text-gray-600">Fetching the latest job opportunities</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="lg:sticky lg:top-6">
            <JobFilters filters={filters} onFiltersChange={setFilters} />
          </div>
        </div>

        {/* Job Listings */}
        <div className="flex-1">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Find Your Dream Job
                </h1>
                <p className="text-gray-600 text-base md:text-lg">
                  {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""} found
                  {currentPage > 1 && ` • Page ${currentPage} of ${totalPages}`}
                </p>
              </div>
            </div>

            {/* Data Status Card */}
            {lastUpdated && (
              <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Database className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Real job data from company career pages</p>
                      <p className="text-xs text-green-600">Last updated: {new Date(lastUpdated).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Data Warning */}
            {allJobs.length === 0 && (
              <Card className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">No scraped job data available</p>
                      <p className="text-xs text-yellow-600">
                        Run <code className="bg-yellow-100 px-1 rounded">npm run scrape-jobs</code> to fetch real job
                        data
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {paginatedJobs.map((job) => (
              <JobListingCard key={job.id} job={job} onViewDetails={handleViewDetails} onApply={handleApply} />
            ))}
          </div>

          {filteredJobs.length === 0 && allJobs.length > 0 && (
            <div className="text-center py-16 px-4">
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
