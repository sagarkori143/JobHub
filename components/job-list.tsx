"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { JobListingCard } from "@/components/job-listing-card"
import { JobDetailsModal } from "@/components/job-details-modal"
import { JobFilters } from "@/components/job-filters"
import { Pagination } from "@/components/pagination"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, X } from "lucide-react"
import type { Job } from "@/types/job"
import type { JobSearchCriteria } from "@/types/job-search"
import { jobDataService } from "@/services/job-data-service"

const JOBS_PER_PAGE = 10

export function JobList() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "")

  const [filters, setFilters] = useState<JobSearchCriteria>({
    keywords: searchParams.get("keywords") || "",
    location: searchParams.get("location") || "",
    jobType: (searchParams.get("jobType")?.split(",") || []) as Job["jobType"][],
    experienceLevel: (searchParams.get("experienceLevel")?.split(",") || []) as Job["experienceLevel"][],
    salaryMin: searchParams.get("salaryMin") ? Number.parseInt(searchParams.get("salaryMin")!) : undefined,
    salaryMax: searchParams.get("salaryMax") ? Number.parseInt(searchParams.get("salaryMax")!) : undefined,
    company: searchParams.get("company") || "",
  })

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      setError(null)
      try {
        const fetchedJobs = await jobDataService.getJobs()
        setJobs(fetchedJobs)
      } catch (err) {
        console.error("Failed to fetch jobs:", err)
        setError("Failed to load jobs. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams()
    if (searchTerm) params.set("q", searchTerm)
    if (filters.keywords) params.set("keywords", filters.keywords)
    if (filters.location) params.set("location", filters.location)
    if (filters.jobType && filters.jobType.length > 0) params.set("jobType", filters.jobType.join(","))
    if (filters.experienceLevel && filters.experienceLevel.length > 0)
      params.set("experienceLevel", filters.experienceLevel.join(","))
    if (filters.salaryMin) params.set("salaryMin", filters.salaryMin.toString())
    if (filters.salaryMax) params.set("salaryMax", filters.salaryMax.toString())
    if (filters.company) params.set("company", filters.company)
    params.set("page", currentPage.toString())
    router.push(`?${params.toString()}`, { scroll: false })
  }, [searchTerm, filters, currentPage, router])

  const filteredJobs = useMemo(() => {
    let filtered = jobs

    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filters.keywords) {
      const keywords = filters.keywords.toLowerCase().split(" ").filter(Boolean)
      filtered = filtered.filter((job) =>
        keywords.some(
          (keyword) =>
            job.title.toLowerCase().includes(keyword) ||
            job.description.toLowerCase().includes(keyword) ||
            job.skills.some((skill) => skill.toLowerCase().includes(keyword)),
        ),
      )
    }
    if (filters.location) {
      filtered = filtered.filter((job) => job.location.toLowerCase().includes(filters.location!.toLowerCase()))
    }
    if (filters.jobType && filters.jobType.length > 0) {
      filtered = filtered.filter((job) => filters.jobType!.includes(job.jobType))
    }
    if (filters.experienceLevel && filters.experienceLevel.length > 0) {
      filtered = filtered.filter((job) => filters.experienceLevel!.includes(job.experienceLevel))
    }
    if (filters.salaryMin) {
      filtered = filtered.filter((job) => job.salary >= filters.salaryMin!)
    }
    if (filters.salaryMax) {
      filtered = filtered.filter((job) => job.salary <= filters.salaryMax!)
    }
    if (filters.company) {
      filtered = filtered.filter((job) => job.company.toLowerCase().includes(filters.company!.toLowerCase()))
    }

    return filtered
  }, [jobs, searchTerm, filters])

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE)
  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * JOBS_PER_PAGE
    const endIndex = startIndex + JOBS_PER_PAGE
    return filteredJobs.slice(startIndex, endIndex)
  }, [filteredJobs, currentPage])

  const handleCardClick = (job: Job) => {
    setSelectedJob(job)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedJob(null)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page on new search
  }

  const handleClearSearch = () => {
    setSearchTerm("")
    setCurrentPage(1)
  }

  const handleFilterChange = (newFilters: JobSearchCriteria) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page on new filters
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading jobs...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      <div className="lg:col-span-1">
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle>Filter Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <JobFilters onFilterChange={handleFilterChange} currentFilters={filters} />
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by title, company, or keywords..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-9"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
        <div className="grid gap-4">
          {paginatedJobs.length > 0 ? (
            paginatedJobs.map((job) => <JobListingCard key={job.id} job={job} onClick={() => handleCardClick(job)} />)
          ) : (
            <p className="text-center text-muted-foreground">No jobs found matching your criteria.</p>
          )}
        </div>
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        )}
      </div>
      {selectedJob && <JobDetailsModal isOpen={isModalOpen} onClose={handleCloseModal} job={selectedJob} />}
    </div>
  )
}
