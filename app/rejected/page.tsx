"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { JobListingCard } from "@/components/job-listing-card"
import { JobDetailsModal } from "@/components/job-details-modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, X } from "lucide-react"
import type { Job } from "@/types/job"
import { jobDataService } from "@/services/job-data-service"
import { Pagination } from "@/components/pagination"

const JOBS_PER_PAGE = 10

export default function RejectedJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchRejectedJobs = async () => {
      setLoading(true)
      setError(null)
      try {
        const allJobs = await jobDataService.getJobs()
        const rejected = allJobs.filter((job) => job.status === "Rejected")
        setJobs(rejected)
      } catch (err) {
        console.error("Failed to fetch rejected jobs:", err)
        setError("Failed to load rejected jobs. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchRejectedJobs()
  }, [])

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
    return filtered
  }, [jobs, searchTerm])

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleClearSearch = () => {
    setSearchTerm("")
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading rejected jobs...</p>
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
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Rejected Jobs</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Rejected Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search rejected jobs..."
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
              <p className="text-center text-muted-foreground">No rejected jobs found.</p>
            )}
          </div>
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          )}
        </CardContent>
      </Card>
      {selectedJob && <JobDetailsModal isOpen={isModalOpen} onClose={handleCloseModal} job={selectedJob} />}
    </div>
  )
}
