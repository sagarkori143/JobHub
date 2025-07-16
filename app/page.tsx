"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { JobListingCard } from "@/components/job-listing-card"
import { JobFilters } from "@/components/job-filters"
import { JobDetailsModal } from "@/components/job-details-modal"
import { Pagination } from "@/components/pagination"
import { useToast } from "@/hooks/use-toast"
import { jobDataService } from "@/services/job-data-service"
import type { JobListing, JobFilters as JobFiltersType } from "@/types/job-search"
import type { Job } from "@/types/job"
import { RefreshCw, Database, AlertCircle, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { UserAvatar } from "@/components/user-avatar"
import { useAuth } from "@/contexts/auth-context"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { useVisitTracking } from "@/hooks/use-visit-tracking"
import { supabase } from "@/lib/supabase"

const initialFilters: JobFiltersType = {
  search: "",
  location: "",
  jobType: "all",
  experienceLevel: "all",
  industry: "all",
  remote: false,
}

const JOBS_PER_PAGE = 6
const SYNC_INTERVAL_MS = 2 * 60 * 60 * 1000 // 2 hours

export default function JobSearchPage() {
  // Use auth guard to allow all users to access job search
  const { isAuthenticated } = useAuthGuard({
    requireAuth: false,
    redirectIfAuthenticated: false
  });
  
  // Track visits to the website
  useVisitTracking();
  
  const [filters, setFilters] = useState<JobFiltersType>(initialFilters)
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [allJobs, setAllJobs] = useState<JobListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<any>(null)
  const [countdown, setCountdown] = useState<string>("")
  const { toast } = useToast()
  const { user, supabaseUser } = useAuth()
  
  // Use refs to avoid re-renders
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const nextUpdateTimeRef = useRef<Date | null>(null)

  // Load jobs on component mount
  useEffect(() => {
    loadJobs()
  }, [])



  // Initialize countdown timer (runs only when metadata or lastUpdated changes)
  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Fetch sync metadata for timer
    const fetchSyncMetadata = async () => {
      try {
        const response = await fetch('/api/jobs/sync-metadata')
        if (response.ok) {
          const data = await response.json()
          
          if (data.nextSync) {
            const nextUpdateTime = new Date(data.nextSync)
            nextUpdateTimeRef.current = nextUpdateTime
            
            // Start countdown timer
            const updateCountdown = () => {
              const now = new Date()
              const diff = nextUpdateTimeRef.current!.getTime() - now.getTime()
              
              if (diff <= 0) {
                // Countdown finished, check for new data
                setCountdown("Checking for updates...")
                loadJobs() // Reload to check for new data
                
                // Reset countdown for next cycle (2 hours from now)
                const newNextUpdate = new Date(now.getTime() + SYNC_INTERVAL_MS)
                nextUpdateTimeRef.current = newNextUpdate
              } else {
                const hours = Math.floor(diff / (1000 * 60 * 60))
                const minutes = Math.floor((diff / (1000 * 60)) % 60)
                const seconds = Math.floor((diff / 1000) % 60)
                setCountdown(`${hours}h ${minutes}m ${seconds}s`)
              }
            }

            // Initial call
            updateCountdown()
            
            // Set interval
            intervalRef.current = setInterval(updateCountdown, 1000)
          }
        }
      } catch (error) {
        console.error('Error fetching sync metadata:', error)
      }
    }

    fetchSyncMetadata()

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [metadata?.hasRealData, lastUpdated]) // Only re-run when these change

  const loadJobs = async () => {
    setIsLoading(true)
    try {
      const jobs = await jobDataService.loadJobs()
      setAllJobs(jobs)

      const metadata = jobDataService.getMetadata()
      setMetadata(metadata)
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
      if (filters.jobType !== "all" && job.type !== filters.jobType) {
        return false
      }

      // Experience level filter
      if (filters.experienceLevel !== "all" && job.experienceLevel !== filters.experienceLevel) {
        return false
      }

      // Industry filter
      if (filters.industry !== "all" && job.industry !== filters.industry) {
        return false
      }

      // Remote filter
      if (filters.remote && !job.remote) {
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
      title: "ℹ️ Application Link Not Available",
      description: `The application link for ${job.title} at ${job.company} has not been updated yet. Please stay tuned for updates!`,
      duration: 5000,
      className: "bg-blue-50 border-blue-300 text-blue-900",
    })
  }

  const handleAddToPersonal = async (job: Omit<Job, "id">) => {
    if (!supabaseUser) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add jobs to your personal dashboard.",
        variant: "destructive",
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from("user_job_applications")
        .insert({
          user_id: supabaseUser.id,
          company: job.company,
          position: job.position,
          date_applied: job.dateApplied,
          status: job.status,
          industry: job.industry,
          estimated_salary: job.estimatedSalary,
          job_type: job.jobType,
          company_logo: job.companyLogo,
        })
        .select()

      if (error) {
        console.error("Error adding job:", error)
        toast({
          title: "Error",
          description: "Failed to add job to your personal dashboard.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Job Added!",
          description: "Job has been added to your personal dashboard.",
          duration: 3000,
        })
      }
    } catch (error) {
      console.error("Error adding job:", error)
      toast({
        title: "Error",
        description: "Failed to add job to your personal dashboard.",
        variant: "destructive",
      })
    }
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
      {/* Welcome Section with Avatar */}
      {user && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
          <div className="flex items-center space-x-4">
            <UserAvatar user={user} size="lg" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Welcome back, {user.name}!</h2>
              <p className="text-gray-600">Ready to find your next opportunity?</p>
            </div>
          </div>
        </div>
      )}

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
            <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">
                      {metadata?.hasRealData ? "Real job data from company career pages" : "Mock job data for demonstration (Real data coming soon!)"}
                    </p>
                    <p className="text-xs text-green-600">
                      {metadata?.hasRealData && lastUpdated
                        ? `Last updated: ${new Date(lastUpdated).toLocaleString()}`
                        : "Last updated: Never"
                      }
                    </p>
                  </div>
                  {/* Countdown timer removed */}
                </div>
              </CardContent>
            </Card>

            {/* No Data Warning */}
            {allJobs.length === 0 && (
              <Card className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">No job data available</p>
                      <p className="text-xs text-yellow-600">
                        Run <code className="bg-yellow-100 px-1 rounded">npm run job-sync</code> to fetch real job data
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
