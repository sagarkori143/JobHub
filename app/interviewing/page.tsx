"use client"

import { useState, useEffect } from "react"
import type { Job } from "@/types/job"
import { JobCard } from "@/components/job-card"
import { JobForm } from "@/components/job-form"
import { JobEditForm } from "@/components/job-edit-form"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function InterviewingPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Load jobs from local storage on mount
    const storedJobs = localStorage.getItem("jobApplications")
    if (storedJobs) {
      setJobs(JSON.parse(storedJobs))
    }
  }, [])

  useEffect(() => {
    // Save jobs to local storage whenever they change
    localStorage.setItem("jobApplications", JSON.stringify(jobs))
  }, [jobs])

  const addJob = (newJob: Job) => {
    setJobs((prevJobs) => [...prevJobs, newJob])
    setIsFormOpen(false)
    toast({
      title: "Job Added",
      description: `${newJob.title} at ${newJob.company} has been added to your applications.`,
    })
  }

  const updateJob = (updatedJob: Job) => {
    setJobs((prevJobs) => prevJobs.map((job) => (job.id === updatedJob.id ? updatedJob : job)))
    setIsEditFormOpen(false)
    setEditingJob(null)
    toast({
      title: "Job Updated",
      description: `${updatedJob.title} at ${updatedJob.company} has been updated.`,
    })
  }

  const deleteJob = (id: string) => {
    setJobs((prevJobs) => prevJobs.filter((job) => job.id !== id))
    toast({
      title: "Job Deleted",
      description: "The job application has been removed.",
      variant: "destructive",
    })
  }

  const handleEditClick = (job: Job) => {
    setEditingJob(job)
    setIsEditFormOpen(true)
  }

  const interviewingJobs = jobs.filter((job) => job.status === "Interviewing")

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Interviewing Jobs</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <PlusCircle className="mr-2 h-5 w-5" />
          Add New Application
        </Button>
      </div>

      {interviewingJobs.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No jobs in interviewing stage yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviewingJobs.map((job) => (
            <JobCard key={job.id} job={job} onEdit={handleEditClick} onDelete={deleteJob} />
          ))}
        </div>
      )}

      <JobForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={addJob} />
      {editingJob && (
        <JobEditForm
          isOpen={isEditFormOpen}
          onClose={() => setIsEditFormOpen(false)}
          onSubmit={updateJob}
          job={editingJob}
        />
      )}
    </div>
  )
}
