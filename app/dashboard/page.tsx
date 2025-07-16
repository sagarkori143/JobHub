"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, TrendingUp, Flame, UserCheck, FileText, Calendar, Sparkles, Loader2, LayoutDashboard } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { mockJobs } from "@/data/mock-jobs"
import { useRouter } from "next/navigation"
import { JobPreferencesModal } from "@/components/job-preferences-modal"
import { LoginModal } from "@/components/login-modal"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { toast } from "@/hooks/use-toast";

function getProfileCompletion(user: any) {
  let completed = 0
  let total = 5
  if (user?.name) completed++
  if (user?.email) completed++
  if (user?.avatar) completed++
  if (user?.resumeUrl) completed++
  if (user?.jobPreferences && user.jobPreferences.keywords.length > 0) completed++
  return Math.round((completed / total) * 100)
}

function getProfileTips(user: any) {
  const tips = []
  if (!user?.avatar) tips.push("Add a profile picture for a personal touch.")
  if (!user?.resumeUrl) tips.push("Upload your resume to get better job matches.")
  if (!user?.jobPreferences || user.jobPreferences.keywords.length === 0) tips.push("Set your job preferences for personalized recommendations.")
  return tips
}

// Add PDF.js loader and extractTextFromPdf utility
async function loadPdfJs() {
  if (typeof window === "undefined") return null;
  if (window.pdfjsLib) return window.pdfjsLib;
  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  return window.pdfjsLib;
}

async function extractTextFromPdf(file) {
  const pdfjs = await loadPdfJs();
  if (!pdfjs) throw new Error("PDF.js failed to load");
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  for (let i = 0; i < pdf.numPages; i++) {
    const page = await pdf.getPage(i + 1);
    const textContent = await page.getTextContent();
    fullText += textContent.items.map((item) => item.str).join(" ");
  }
  return fullText;
}

export default function MainDashboard() {
  const { user, updateProfile, isAuthenticated } = useAuth()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  
  const [resumeUploading, setResumeUploading] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [isJobPreferencesModalOpen, setIsJobPreferencesModalOpen] = useState(false)
  const [loadingStep, setLoadingStep] = useState<null | "extract" | "upload" | "score" | "done">(null)
  const profileCompletion = getProfileCompletion(user)
  const profileTips = getProfileTips(user)
  const router = useRouter()

  // Recommended jobs: filter by user preferences (mock logic)
  const recommendedJobs = useMemo(() => {
    if (!user?.jobPreferences) return []
    return mockJobs.filter(job =>
      user.jobPreferences.keywords.some((kw: string) => job.title.toLowerCase().includes(kw.toLowerCase()))
    ).slice(0, 5)
  }, [user])

  // Trending jobs: top 5 by company frequency
  const trendingJobs = useMemo(() => {
    const companyCounts: Record<string, number> = {}
    mockJobs.forEach(job => {
      companyCounts[job.company] = (companyCounts[job.company] || 0) + 1
    })
    const topCompanies = Object.entries(companyCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([company]) => company)
    return mockJobs.filter(job => topCompanies.includes(job.company)).slice(0, 5)
  }, [])

  // Streaks (mock logic)
  const streaks = user?.streaks || { daysActive: 3, applicationsSent: 7 }

  // ATS Score Trends (real logic)
  // Show sign-in prompt if user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
            <LayoutDashboard className="w-12 h-12 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Main Dashboard
            </h1>
            <p className="text-gray-600 text-base sm:text-lg">
              Sign in to access your personalized job dashboard and track your applications
            </p>
          </div>
          <Button 
            onClick={() => setIsLoginModalOpen(true)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
          >
            Sign In to Continue
          </Button>
        </div>
      </div>
    )
  }

  const atsScores = user?.resume_scores || [];
  const hasResume = !!user?.resume_url;

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setResumeUploading(true)
    setResumeFile(file)
    setLoadingStep("extract")
    let extractedText = ""
    try {
      if (file.type === "application/pdf") {
        extractedText = await extractTextFromPdf(file)
      } else if (file.type === "text/plain") {
        extractedText = await file.text()
      } else {
        throw new Error("Unsupported file type")
      }
      setLoadingStep("upload")
      // Upload extracted text to backend
      const res = await fetch("/api/upload/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, resumeText: extractedText })
      })
      setLoadingStep("score")
      if (!res.ok) {
        throw new Error("Failed to upload and score resume")
      }
      // Refetch user profile to update ATS scores
      if (updateProfile) {
        await updateProfile({})
      }
      toast({
        title: "Resume Scored!",
        description: "Your ATS score has been updated.",
      })
      setLoadingStep("done")
      setTimeout(() => setLoadingStep(null), 1200)
    } catch (err) {
      setLoadingStep(null)
      // Show error toast or message
    } finally {
      setResumeUploading(false)
    }
  }

  // Loader UI components
  const loaderStepMessage = {
    extract: "Extracting text from your resume...",
    upload: "Uploading and analyzing your resume...",
    score: "Scoring your resume with AI...",
    done: "Resume scored!"
  };

  const steps = [
    { key: "extract", label: "Extract" },
    { key: "upload", label: "Upload" },
    { key: "score", label: "Score" }
  ];
  const stepIndex = steps.findIndex(s => s.key === loadingStep);

  return (
    <div className="space-y-8 p-4 md:p-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome, {user?.name || "Job Seeker"}!</h1>
          <p className="text-gray-600 text-base md:text-lg">Here's your personalized job dashboard.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500">Profile Completion</span>
            <div className="flex items-center gap-2">
              <Progress value={profileCompletion} className="w-24 h-2" />
              <span className="text-sm font-semibold text-blue-700">{profileCompletion}%</span>
              <Button
                size="icon"
                className="ml-1"
                onClick={() => router.push("/profile")}
                variant="outline"
                aria-label="Go to Profile"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Tips */}
      {profileTips.length > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Tips to complete your profile:</span>
            </div>
            <ul className="list-disc list-inside text-yellow-700 text-sm">
              {profileTips.map((tip, i) => <li key={i}>{tip}</li>)}
            </ul>
            <div className="flex gap-2 mt-4">
              <Button size="sm" onClick={() => router.push("/profile")}>Go to Profile Settings</Button>
              <Button size="sm" variant="outline" onClick={() => setIsJobPreferencesModalOpen(true)}>Update Job Preferences</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ATS Score Trends - Full Width */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-green-600" /> ATS Score Trends</CardTitle>
          <CardDescription>See how your resume scores have improved over time.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-64">
            {atsScores.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">No ATS scores yet. Upload your resume to get started!</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={atsScores} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} domain={[0, 100]} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 14 }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} isAnimationActive animationDuration={250} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-end mt-2">
            {/* Stepper Loader */}
            {loadingStep ? (
              <div className="flex flex-col items-end w-full">
                <div className="flex items-center gap-4 mb-2">
                  {steps.map((step, idx) => (
                    <div key={step.key} className="flex items-center">
                      <div className={`rounded-full w-8 h-8 flex items-center justify-center border-2 transition-all duration-200
                        ${idx < stepIndex ? 'bg-green-500 border-green-500 text-white' :
                          idx === stepIndex ? 'bg-blue-600 border-blue-600 text-white animate-pulse' :
                          'bg-gray-200 border-gray-300 text-gray-400'}`}
                      >
                        {idx < stepIndex ? <span className="font-bold">✓</span> : idx === stepIndex ? <Loader2 className="w-5 h-5 animate-spin" /> : idx+1}
                      </div>
                      {idx < steps.length - 1 && (
                        <div className={`w-10 h-1 ${idx < stepIndex ? 'bg-green-500' : 'bg-gray-300'} transition-all duration-200`}></div>
                      )}
                    </div>
                  ))}
                </div>
                <span className="text-sm font-medium text-blue-700 mb-1">{loaderStepMessage[loadingStep]}</span>
              </div>
            ) : (
              <>
                <input type="file" accept=".pdf,.txt" onChange={handleResumeUpload} className="hidden" id="resume-upload" />
                <label htmlFor="resume-upload">
                  <Button size="sm" variant="outline" asChild disabled={resumeUploading || !!loadingStep}>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      {resumeUploading || loadingStep ? "Uploading..." : hasResume ? "Update Resume" : "Upload Resume"}
                    </span>
                  </Button>
                </label>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommended & Trending Jobs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-purple-600" /> Recommended Jobs</CardTitle>
            <CardDescription>Curated for you based on your preferences.</CardDescription>
          </CardHeader>
          <CardContent>
            {recommendedJobs.length === 0 ? (
              <span className="text-gray-500 text-sm">No recommendations yet. Set your preferences!</span>
            ) : (
              <ul className="space-y-2">
                {recommendedJobs.map(job => (
                  <li key={job.id} className="flex flex-col border-b pb-2">
                    <span className="font-semibold">{job.title}</span>
                    <span className="text-xs text-gray-500">{job.company} • {job.location}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Flame className="w-5 h-5 text-pink-600" /> Trending Jobs</CardTitle>
            <CardDescription>Popular jobs and companies hiring now.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {trendingJobs.map(job => (
                <li key={job.id} className="flex flex-col border-b pb-2">
                  <span className="font-semibold">{job.title}</span>
                  <span className="text-xs text-gray-500">{job.company} • {job.location}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Streaks */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-600" /> Streaks</CardTitle>
          <CardDescription>Keep your job search momentum going!</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-8 items-center">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-blue-700">{streaks.daysActive}</span>
            <span className="text-xs text-gray-500">Days Active</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-green-700">{streaks.applicationsSent}</span>
            <span className="text-xs text-gray-500">Applications Sent</span>
          </div>
        </CardContent>
      </Card>

      {/* Job Preferences Modal */}
      <JobPreferencesModal isOpen={isJobPreferencesModalOpen} onClose={() => setIsJobPreferencesModalOpen(false)} />
      
      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  )
}
