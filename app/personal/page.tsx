"use client"

import { useState, useEffect } from "react"
import type { Job } from "@/types/job"
import { JobCard } from "@/components/job-card"
import { JobForm } from "@/components/job-form"
import { JobEditForm } from "@/components/job-edit-form"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PersonalDashboardPage() {
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

  const filterJobsByStatus = (status: Job["status"] | "All") => {
    if (status === "All") {
      return jobs
    }
    return jobs.filter((job) => job.status === status)
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">My Job Applications</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <PlusCircle className="mr-2 h-5 w-5" />
          Add New Application
        </Button>
      </div>

      <Tabs defaultValue="All" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 h-auto">
          <TabsTrigger value="All">All ({jobs.length})</TabsTrigger>
          <TabsTrigger value="Applied">Applied ({filterJobsByStatus("Applied").length})</TabsTrigger>
          <TabsTrigger value="Interviewing">Interviewing ({filterJobsByStatus("Interviewing").length})</TabsTrigger>
          <TabsTrigger value="Offer">Offers ({filterJobsByStatus("Offer").length})</TabsTrigger>
          <TabsTrigger value="Rejected">Rejected ({filterJobsByStatus("Rejected").length})</TabsTrigger>
          <TabsTrigger value="Wishlist">Wishlist ({filterJobsByStatus("Wishlist").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="All" className="mt-6">
          {filterJobsByStatus("All").length === 0 ? (
            <div className="text-center py-10 text-gray-500">No job applications added yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterJobsByStatus("All").map((job) => (
                <JobCard key={job.id} job={job} onEdit={handleEditClick} onDelete={deleteJob} />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="Applied" className="mt-6">
          {filterJobsByStatus("Applied").length === 0 ? (
            <div className="text-center py-10 text-gray-500">No applied jobs yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterJobsByStatus("Applied").map((job) => (
                <JobCard key={job.id} job={job} onEdit={handleEditClick} onDelete={deleteJob} />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="Interviewing" className="mt-6">
          {filterJobsByStatus("Interviewing").length === 0 ? (
            <div className="text-center py-10 text-gray-500">No jobs in interviewing stage yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterJobsByStatus("Interviewing").map((job) => (
                <JobCard key={job.id} job={job} onEdit={handleEditClick} onDelete={deleteJob} />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="Offer" className="mt-6">
          {filterJobsByStatus("Offer").length === 0 ? (
            <div className="text-center py-10 text-gray-500">No job offers recorded yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterJobsByStatus("Offer").map((job) => (
                <JobCard key={job.id} job={job} onEdit={handleEditClick} onDelete={deleteJob} />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="Rejected" className="mt-6">
          {filterJobsByStatus("Rejected").length === 0 ? (
            <div className="text-center py-10 text-gray-500">No rejected jobs recorded yet. Keep trying!</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterJobsByStatus("Rejected").map((job) => (
                <JobCard key={job.id} job={job} onEdit={handleEditClick} onDelete={deleteJob} />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="Wishlist" className="mt-6">
          {filterJobsByStatus("Wishlist").length === 0 ? (
            <div className="text-center py-10 text-gray-500">No jobs in your wishlist yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterJobsByStatus("Wishlist").map((job) => (
                <JobCard key={job.id} job={job} onEdit={handleEditClick} onDelete={deleteJob} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

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
