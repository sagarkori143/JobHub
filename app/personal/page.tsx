"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { JobCard } from "@/components/job-card"
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
import type { Job } from "@/types/job"
import { useAuth } from "@/contexts/auth-context"

const initialJobs: Job[] = [
  {
    id: "1",
    company: "Tech Corp",
    position: "Software Engineer",
    dateApplied: "2023-05-01",
    status: "Applied",
    industry: "Technology",
    estimatedSalary: 80000,
  },
  {
    id: "2",
    company: "Data Inc",
    position: "Data Analyst",
    dateApplied: "2023-05-03",
    status: "Applied",
    industry: "Technology",
    estimatedSalary: 70000,
  },
  {
    id: "3",
    company: "Design Solutions",
    position: "UX Designer",
    dateApplied: "2023-05-05",
    status: "Applied",
    industry: "Technology",
    estimatedSalary: 75000,
  },
  {
    id: "4",
    company: "City High School",
    position: "Teacher",
    dateApplied: "2023-04-15",
    status: "Interviewing",
    industry: "Education",
    estimatedSalary: 55000,
  },
  {
    id: "5",
    company: "Investment Bank",
    position: "Financial Analyst",
    dateApplied: "2023-04-20",
    status: "Interviewing",
    industry: "Finance",
    estimatedSalary: 85000,
  },
  {
    id: "6",
    company: "Retail Chain",
    position: "Store Manager",
    dateApplied: "2023-03-10",
    status: "Offer",
    industry: "Retail",
    estimatedSalary: 60000,
  },
  {
    id: "7",
    company: "City Hospital",
    position: "Nurse",
    dateApplied: "2023-03-15",
    status: "Offer",
    industry: "Healthcare",
    estimatedSalary: 70000,
  },
  {
    id: "8",
    company: "University",
    position: "Professor",
    dateApplied: "2023-02-01",
    status: "Rejected",
    industry: "Education",
    estimatedSalary: 90000,
  },
  {
    id: "9",
    company: "Fashion Outlet",
    position: "Sales Associate",
    dateApplied: "2023-02-15",
    status: "Rejected",
    industry: "Retail",
    estimatedSalary: 35000,
  },
]

export default function PersonalDashboard() {
  const [jobs, setJobs] = useState(initialJobs)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const { user, isAuthenticated } = useAuth()

  // Show sign-in prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-white to-pink-50/30 flex items-center justify-center p-4">
          {" "}
          {/* Added responsive padding */}
          <div className="text-center space-y-6 max-w-md mx-auto p-4 sm:p-8">
            {" "}
            {/* Added responsive padding */}
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
              <User className="w-12 h-12 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Personal Dashboard
              </h1>
              <p className="text-gray-600 text-base sm:text-lg">
                Sign in to access your job applications and track your progress
              </p>
            </div>
            <div className="space-y-4">
              <Button
                onClick={() => setIsLoginModalOpen(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                size="lg"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Sign In to Continue
              </Button>

              <div className="text-sm text-gray-500">Demo credentials: sagar@gmail.com / sagarkori</div>
            </div>
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-blue-800 mb-2">What you'll get access to:</h3>
                <ul className="text-sm text-blue-700 space-y-1 text-left">
                  <li>• Track your job applications</li>
                  <li>• Manage application status</li>
                  <li>• Set job preferences & alerts</li>
                  <li>• Resume ATS scoring</li>
                  <li>• Application analytics</li>
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

  const handleAddJob = (newJob: Omit<Job, "id">) => {
    const jobWithId = { ...newJob, id: (jobs.length + 1).toString() }
    setJobs([...jobs, jobWithId])
    setIsDialogOpen(false)
  }

  const handleUpdateJob = (updatedJob: Job) => {
    setJobs(jobs.map((job) => (job.id === updatedJob.id ? updatedJob : job)))
  }

  const handleDeleteJob = (jobToDelete: Job) => {
    setJobToDelete(jobToDelete)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteJob = () => {
    if (jobToDelete) {
      setJobs(jobs.filter((job) => job.id !== jobToDelete.id))
      setJobToDelete(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleMoveStatus = (job: Job, direction: "forward" | "backward") => {
    const statusOrder = ["Applied", "Interviewing", "Offer", "Rejected"]
    const currentIndex = statusOrder.indexOf(job.status)
    const newIndex = direction === "forward" ? currentIndex + 1 : currentIndex - 1

    if (newIndex >= 0 && newIndex < statusOrder.length) {
      const updatedJob = { ...job, status: statusOrder[newIndex] as Job["status"] }
      setJobs(jobs.map((j) => (j.id === job.id ? updatedJob : j)))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-white to-pink-50/30 p-4 md:p-8">
      {" "}
      {/* Adjusted responsive padding */}
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Hello, {user?.name || "Guest"}! 👋
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
              {" "}
              {/* Adjusted for responsiveness */}
              <DialogHeader>
                <DialogTitle>Add New Job Application</DialogTitle>
              </DialogHeader>
              <JobForm onSubmit={handleAddJob} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {" "}
          {/* Made responsive */}
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
          {" "}
          {/* Made responsive */}
          <div className={`space-y-4 ${appliedJobs.length > 5 ? "md:col-span-2 lg:col-span-2" : ""}`}>
            <h2 className="text-xl font-semibold mb-4 text-blue-600">Applied Jobs ({appliedJobs.length})</h2>
            {appliedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                className="bg-blue-50 border-blue-200"
                onUpdate={handleUpdateJob}
                onDelete={handleDeleteJob}
                onMoveStatus={handleMoveStatus}
              />
            ))}
          </div>
          <div className={`space-y-4 ${interviewingJobs.length > 5 ? "md:col-span-2 lg:col-span-2" : ""}`}>
            <h2 className="text-xl font-semibold mb-4 text-yellow-600">Interviewing ({interviewingJobs.length})</h2>
            {interviewingJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                className="bg-yellow-50 border-yellow-200"
                onUpdate={handleUpdateJob}
                onDelete={handleDeleteJob}
                onMoveStatus={handleMoveStatus}
              />
            ))}
          </div>
          <div className={`space-y-4 ${offerJobs.length > 5 ? "md:col-span-2 lg:col-span-2" : ""}`}>
            <h2 className="text-xl font-semibold mb-4 text-green-600">Offers ({offerJobs.length})</h2>
            {offerJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                className="bg-green-50 border-green-200"
                onUpdate={handleUpdateJob}
                onDelete={handleDeleteJob}
                onMoveStatus={handleMoveStatus}
              />
            ))}
          </div>
          <div className={`space-y-4 ${rejectedJobs.length > 5 ? "md:col-span-2 lg:col-span-2" : ""}`}>
            <h2 className="text-xl font-semibold mb-4 text-red-600">Rejected ({rejectedJobs.length})</h2>
            {rejectedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                className="bg-red-50 border-red-200"
                onUpdate={handleUpdateJob}
                onDelete={handleDeleteJob}
                onMoveStatus={handleMoveStatus}
              />
            ))}
          </div>
        </div>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            {" "}
            {/* Adjusted for responsiveness */}
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
