"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, LogIn, User } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { JobForm } from "@/components/job-form"
import { LoginModal } from "@/components/login-modal"
import { JobCard } from "@/components/job-card"
import type { Job } from "@/types/job"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

const toDbColumns = (job: Omit<Job, "id"> | Job) => ({
  company: job.company,
  position: job.position,
  date_applied: job.dateApplied,
  status: job.status,
  industry: job.industry,
  estimated_salary: job.estimatedSalary,
  job_type: job.jobType,
  company_logo: job.companyLogo,
})

export default function PersonalDashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [loadingJobs, setLoadingJobs] = useState(true)

  const { user, isAuthenticated, loading: authLoading, isInitialized, addTrackedJob, updateTrackedJob, removeTrackedJob } = useAuth()
  const { toast } = useToast()

  // Use jobsTracking from user context
  const jobs = user?.jobsTracking || [];
  const fetchJobs = useCallback(async () => {
    if (!user) {
      setLoadingJobs(false)
      return
    }

    setLoadingJobs(true)

    
    setLoadingJobs(false)
  }, [user, toast])

  useEffect(() => {
    if (!authLoading) {
      fetchJobs()
    }
  }, [authLoading, fetchJobs])

  // Wait for auth context to be initialized before rendering
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p>Loading your dashboard...</p>
        <p>If it is taking too long, try refreshing the page!</p>
      </div>
    )
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p>Loading your dashboard...</p>
        <p>If it is taking too long, try refreshing the page!</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-white to-pink-50/30 flex items-center justify-center p-4">
          <div className="text-center space-y-6 max-w-md mx-auto p-4 sm:p-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
              <User className="w-12 h-12 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Applications Tracking
              </h1>
              <p className="text-gray-600 text-base sm:text-lg">
                Sign in to access your job applications and track your progress
              </p>
            </div>
            <div className="space-y-4">
              {!authLoading && (
                <Button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                  size="lg"
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In to Continue
                </Button>
              )}
            </div>
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-blue-800 mb-2">Here is what you will get</h3>
                <ul className="text-sm text-blue-700 space-y-1 text-left">
                  <li>• Track your job applications</li>
                  <li>• Manage application status</li>
                  <li>• Set job preferences & alerts</li>
                  <li>• Resume ATS scoring</li>
                  <li>• Application analytics</li>
                  <li>• And a lot more...</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      </>
    )
  }

  const appliedJobs = jobs.filter((job) => job.status === "Applied")
  const interviewingJobs = jobs.filter((job) => job.status === "Interviewing")
  const offerJobs = jobs.filter((job) => job.status === "Offer")
  const rejectedJobs = jobs.filter((job) => job.status === "Rejected")

  const handleAddJob = async (newJob: Omit<Job, "id">) => {
    // Check authentication state before proceeding
    if (!isAuthenticated || !user?.id) {
      toast({
        title: "Authentication Error",
        description: "Please log in again to add job applications.",
        variant: "destructive"
      });
      return;
    }

    // Generate a unique id for the job (could use uuid or Date.now() for demo)
    const jobWithId = { ...newJob, id: Date.now().toString() };
    await addTrackedJob(jobWithId);
    toast({
      title: "Success!",
      description: "Job application added successfully.",
    });
    setIsDialogOpen(false);
  };

  const handleUpdateJob = async (updatedJob: Job) => {
    // Check authentication state before proceeding
    if (!isAuthenticated || !user?.id) {
      toast({
        title: "Authentication Error",
        description: "Please log in again to update job applications.",
        variant: "destructive"
      });
      return;
    }

    await updateTrackedJob(updatedJob.id, updatedJob);
    toast({
      title: "Success!",
      description: "Job application updated successfully.",
    });
  };

  const handleDeleteJob = (job: Job) => {
    setJobToDelete(job);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteJob = async () => {
    if (!jobToDelete) return;
    
    // Check authentication state before proceeding
    if (!isAuthenticated || !user?.id) {
      toast({
        title: "Authentication Error",
        description: "Please log in again to delete job applications.",
        variant: "destructive"
      });
      return;
    }

    await removeTrackedJob(jobToDelete.id);
    toast({
      title: "Success!",
      description: "Job application deleted successfully.",
    });
    setJobToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const handleMoveStatus = async (job: Job, direction: "forward" | "backward") => {
    if (!user) return

    // Check authentication state before proceeding
    if (!isAuthenticated || !user?.id) {
      toast({
        title: "Authentication Error",
        description: "Please log in again to update job status.",
        variant: "destructive"
      });
      return;
    }

    const statusOrder = ["Applied", "Interviewing", "Offer", "Rejected"]
    const currentIndex = statusOrder.indexOf(job.status)
    const newIndex = direction === "forward" ? currentIndex + 1 : currentIndex - 1

    if (newIndex >= 0 && newIndex < statusOrder.length) {
      const newStatus = statusOrder[newIndex] as Job["status"]
      const updatedJob = { ...job, status: newStatus };
      await updateTrackedJob(job.id, updatedJob);
      toast({
        title: "Success!",
        description: `Job status moved to ${newStatus}.`,
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-white to-pink-50/30 p-4 md:p-8">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Applications Tracking
            </h1>
            <p className="text-gray-600 text-base md:text-lg mt-2">Welcome back to your job application dashboard</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
                <PlusCircle className="mr-2 h-4 w-4" /> New Job Application
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Job Application</DialogTitle>
              </DialogHeader>
              <JobForm onSubmit={handleAddJob} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{jobs.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800">Interviews Scheduled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-900">{interviewingJobs.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-100 to-green-200 border-green-300 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Offers Received</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{offerJobs.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-100 to-red-200 border-red-300 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-800">Rejection Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-900">
                {jobs.length > 0 ? Math.round((rejectedJobs.length / jobs.length) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-auto">
          {/* Always render all four status columns side by side */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">Applied Jobs ({appliedJobs.length})</h2>
            {appliedJobs.length === 0 ? (
              <p className="text-gray-400 text-sm">No jobs in this section.</p>
            ) : (
              appliedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  className="bg-blue-50 border-blue-200"
                  onUpdate={handleUpdateJob}
                  onDelete={handleDeleteJob}
                  onMoveStatus={handleMoveStatus}
                />
              ))
            )}
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4 text-yellow-600">Interviewing ({interviewingJobs.length})</h2>
            {interviewingJobs.length === 0 ? (
              <p className="text-gray-400 text-sm">No jobs in this section.</p>
            ) : (
              interviewingJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  className="bg-yellow-50 border-yellow-200"
                  onUpdate={handleUpdateJob}
                  onDelete={handleDeleteJob}
                  onMoveStatus={handleMoveStatus}
                />
              ))
            )}
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4 text-green-600">Offers ({offerJobs.length})</h2>
            {offerJobs.length === 0 ? (
              <p className="text-gray-400 text-sm">No jobs in this section.</p>
            ) : (
              offerJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  className="bg-green-50 border-green-200"
                  onUpdate={handleUpdateJob}
                  onDelete={handleDeleteJob}
                  onMoveStatus={handleMoveStatus}
                />
              ))
            )}
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4 text-red-600">Rejected ({rejectedJobs.length})</h2>
            {rejectedJobs.length === 0 ? (
              <p className="text-gray-400 text-sm">No jobs in this section.</p>
            ) : (
              rejectedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  className="bg-red-50 border-red-200"
                  onUpdate={handleUpdateJob}
                  onDelete={handleDeleteJob}
                  onMoveStatus={handleMoveStatus}
                />
              ))
            )}
          </div>
        </div>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Are you sure you want to delete the job application for {jobToDelete?.position} at {jobToDelete?.company}?
              This action is final and cannot be undone.
            </DialogDescription>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteJob}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
