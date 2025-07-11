"use client"

import { useState, useEffect } from "react"
import type { JobListing } from "@/types/job-search"
import { JobListingCard } from "@/components/job-listing-card"
import { JobDetailsModal } from "@/components/job-details-modal"
import { Pagination } from "@/components/pagination"
import { JobFilters } from "@/components/job-filters"
import { useToast } from "@/hooks/use-toast"

interface JobListProps {
  jobs: JobListing[]
}

export function JobList({ jobs }: JobListProps) {
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredJobs, setFilteredJobs] = useState<JobListing[]>(jobs)
  const [filters, setFilters] = useState({
    keywords: "",
    location: "",
    type: "",
    experienceLevel: "",
    salaryMin: "",
    remote: false,
  })
  const jobsPerPage = 10
  const { toast } = useToast()

  useEffect(() => {
    applyFilters()
  }, [jobs, filters])

  const applyFilters = () => {
    let tempJobs = jobs

    if (filters.keywords) {
      const keywords = filters.keywords.toLowerCase().split(" ")
      tempJobs = tempJobs.filter((job) =>
        keywords.every(
          (keyword) =>
            job.title.toLowerCase().includes(keyword) ||
            job.company.toLowerCase().includes(keyword) ||
            job.description.toLowerCase().includes(keyword),
        ),
      )
    }

    if (filters.location) {
      tempJobs = tempJobs.filter((job) => job.location.toLowerCase().includes(filters.location.toLowerCase()))
    }

    if (filters.type) {
      tempJobs = tempJobs.filter((job) => job.type.toLowerCase() === filters.type.toLowerCase())
    }

    if (filters.experienceLevel) {
      tempJobs = tempJobs.filter((job) => job.experienceLevel.toLowerCase() === filters.experienceLevel.toLowerCase())
    }

    if (filters.salaryMin) {
      const minSalary = Number.parseFloat(filters.salaryMin)
      if (!isNaN(minSalary)) {
        tempJobs = tempJobs.filter((job) => job.salary && job.salary.min >= minSalary)
      }
    }

    if (filters.remote) {
      tempJobs = tempJobs.filter((job) => job.remote)
    }

    setFilteredJobs(tempJobs)
    setCurrentPage(1) // Reset to first page on filter change
  }

  const handleCardClick = (job: JobListing) => {
    setSelectedJob(job)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedJob(null)
  }

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage)
  const currentJobs = filteredJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage)

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="lg:w-1/4">
        <JobFilters filters={filters} setFilters={setFilters} />
      </div>
      <div className="lg:w-3/4">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No jobs found matching your criteria. Try adjusting your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {currentJobs.map((job) => (
              <JobListingCard key={job.id} job={job} onClick={() => handleCardClick(job)} />
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        )}
      </div>
      {selectedJob && <JobDetailsModal isOpen={isModalOpen} onClose={handleCloseModal} job={selectedJob} />}
    </div>
  )
}
