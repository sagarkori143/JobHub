"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { FileText, CheckCircle, AlertCircle, XCircle, Sparkles, Loader2, Upload, ChevronDown } from "lucide-react"
import { ResumeStepperLoader } from "@/components/ResumeStepperLoader"
import { toast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { mockJobs } from "@/data/mock-jobs" // Assuming mockJobs is suitable for client-side use

// ---- PDF.js dynamic loader ----------------------------------------------
declare global {
  interface Window {
    pdfjsLib: any
  }
}

/**
 * Loads the browser build of PDF.js only once and returns the pdfjsLib object.
 * Updated to use a more reliable loading method with better error handling.
 */
async function loadPdfJs(): Promise<any> {
  if (typeof window === "undefined") return null // SSR guard (shouldn't run)
  if (window.pdfjsLib) return window.pdfjsLib

  try {
    // Load PDF.js from CDN
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script")
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
      script.onload = () => resolve()
      script.onerror = () => reject(new Error("Failed to load PDF.js"))
      document.head.appendChild(script)
    })

    // Configure the worker
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
    return window.pdfjsLib
  } catch (error) {
    console.error("Failed to load PDF.js:", error)
    throw new Error("PDF.js failed to load. Please try pasting your resume text directly.")
  }
}
// --------------------------------------------------------------------------

interface ATSResult {
  score: number
  strengths: string[]
  improvements: string[]
  keywords: {
    found: string[]
    missing: string[]
  }
}

function ResumeScoringContent() {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeText, setResumeText] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<ATSResult | null>(null)
  const resumeFileInputRef = React.useRef<HTMLInputElement>(null)
  const searchParams = useSearchParams()
  const [loadingStep, setLoadingStep] = useState<null | "extract" | "upload" | "score" | "done">(null)
  // Remove stepperStep state, handled in loader component

  // Pre-fill job description from URL parameter
  useEffect(() => {
    const jobDescriptionParam = searchParams.get('jobDescription')
    if (jobDescriptionParam) {
      const decodedDescription = decodeURIComponent(jobDescriptionParam)
      setJobDescription(decodedDescription)
      toast({
        title: "Job Description Loaded",
        description: "Job description has been pre-filled from your selection.",
      })
    }
  }, [searchParams])

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const pdfjs = await loadPdfJs()
    if (!pdfjs) throw new Error("PDF.js failed to load")

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
    let fullText = ""

    for (let i = 0; i < pdf.numPages; i++) {
      const page = await pdf.getPage(i + 1)
      const textContent = await page.getTextContent()
      fullText += textContent.items.map((item: any) => item.str).join(" ")
    }
    return fullText
  }

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setResumeFile(file)
      setResumeText("")
      setResult(null)
      if (file.type === "application/pdf") {
        try {
          const extractedText = await extractTextFromPdf(file)
          setResumeText(extractedText)
          toast({ title: "PDF Parsed", description: "Text extracted from your resume PDF." })
        } catch (error) {
          console.error("Error parsing PDF:", error)
          toast({ title: "PDF Parsing Failed", description: "Could not extract text from PDF. Please try pasting text directly.", variant: "destructive" })
          setResumeFile(null)
          setResumeText("")
        }
      } else if (file.type === "text/plain") {
        const reader = new FileReader()
        reader.onload = (e) => {
          setResumeText(e.target?.result as string)
          toast({ title: "Text File Loaded", description: "Content extracted from your text file." })
        }
        reader.readAsText(file)
      }
    }
  }

  const handleJobSelect = (jobDescription: string) => {
    setJobDescription(jobDescription)
    toast({
      title: "Job Description Selected",
      description: "The job description has been loaded into the text area.",
    })
  }

  const analyzeResume = async () => {
    const finalResumeContent = resumeText.trim()
    if (!finalResumeContent || !jobDescription.trim()) {
      toast({ title: "Missing Information", description: "Please provide either resume text/file and job description.", variant: "destructive" })
      return
    }
    setIsAnalyzing(true)
    setResult(null)
    setLoadingStep("upload")
    let stepIdx = 0;
    const stepSequence = ["upload", "extract", "score"];
    for (const step of stepSequence) {
      setLoadingStep(step as any);
      await new Promise(res => setTimeout(res, 1000));
      stepIdx++;
      if (step === "score") {
        try {
          const response = await fetch("/api/score-resume", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resumeText: finalResumeContent, jobDescription }),
          })
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to fetch ATS score.")
          }
          const data: ATSResult = await response.json()
          setResult(data)
        } catch (error: any) {
          setLoadingStep(null)
          setIsAnalyzing(false)
          toast({ title: "Error", description: error.message || "Failed to score resume. Please try again.", variant: "destructive" })
          return;
        }
      }
    }
    setLoadingStep("done")
    setTimeout(() => setLoadingStep(null), 1200)
    setIsAnalyzing(false)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-6 h-6 text-green-600" />
    if (score >= 60) return <AlertCircle className="w-6 h-6 text-yellow-600" />
    return <XCircle className="w-6 h-6 text-red-600" />
  }

  const loaderStepMessage = {
    extract: "Extracting text from your resume...",
    upload: "Uploading and analyzing your resume...",
    score: "Scoring your resume with AI...",
    done: "Resume scored!"
  };

  const steps = [
    { key: "upload", label: "Upload" },
    { key: "extract", label: "Extract" },
    { key: "score", label: "Score" }
  ];
  const stepIndex = steps.findIndex(s => s.key === loadingStep);

  // Responsive, labeled stepper loader
  const stepperLabels = ["Uploaded", "Extracted", "Calculating"];
  const stepperKeys = ["upload", "extract", "score"];
  const currentStepIdx = stepperKeys.indexOf(loadingStep as string);

  return (
    <div className="space-y-8 p-4 md:p-0">
      {/* Toggle for loader style */}
      {/* Remove showModalLoader and toggle */}
      {/* Modal/Overlay Loader */}
      {/* Remove showModalLoader and toggle */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">AI Resume ATS Scoring</h1>
        <p className="text-gray-600 text-base md:text-lg">
          Upload or paste your resume and a job description to get an AI-powered compatibility score and optimization
          suggestions.
        </p>
      </div>

      {/* Input Section: Resume & Job Description in a single horizontal card */}
      <Card>
        <CardHeader>
          <CardTitle>Your Resume & Job Description</CardTitle>
          <CardDescription>Provide your resume content and the job description for analysis.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Resume Input */}
            <div>
              <Label htmlFor="resume-text">Resume Text</Label>
              <Textarea
                id="resume-text"
                placeholder="Paste your resume text here..."
                value={resumeText}
                onChange={(e) => {
                  setResumeText(e.target.value)
                  setResumeFile(null) // Clear file if text is entered
                }}
                rows={10}
                className="mt-1 min-h-[150px]"
              />
              <div className="flex items-center justify-center text-gray-500 my-2">
                <span className="mx-2">OR</span>
              </div>
              <div>
                <input
                  id="resume-file"
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleResumeUpload}
                  className="hidden" // Hide the default input
                  ref={resumeFileInputRef}
                />
                <Button onClick={() => resumeFileInputRef.current?.click()} className="w-full mt-1" variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  {resumeFile ? resumeFile.name : "Choose File (PDF or TXT)"}
                </Button>
                {resumeFile && (
                  <div className="flex items-center space-x-2 mt-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>{resumeFile.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Job Description Input */}
            <div>
              <Label htmlFor="jobDescription">Job Description</Label>
              <Textarea
                id="jobDescription"
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={10}
                className="mt-1 min-h-[150px]"
              />
              <div className="flex items-center justify-center text-gray-500 my-2">
                <span className="mx-2">OR</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full bg-transparent">
                    Select from Available Jobs
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[--radix-popper-anchor-width] max-h-60 overflow-y-auto">
                  {mockJobs.map((job) => (
                    <DropdownMenuItem key={job.id} onSelect={() => handleJobSelect(job.description)}>
                      {job.title} ({job.company})
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Stepper Loader for Analyze Button */}
          {loadingStep ? (
            <ResumeStepperLoader step={loadingStep} steps={steps} />
          ) : (
            <Button
              onClick={analyzeResume}
              disabled={(!resumeText.trim() && !resumeFile) || !jobDescription.trim() || isAnalyzing || !!loadingStep}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze Resume
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <>
          {/* Score and Keywords */}
          <Card>
            <CardHeader>
              <CardTitle>ATS Analysis Results</CardTitle>
              <CardDescription>Detailed insights from the AI analysis.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Score */}
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    {getScoreIcon(result.score)}
                    <span className={`text-3xl font-bold ${getScoreColor(result.score)}`}>{result.score}%</span>
                  </div>
                  <Progress value={result.score} className="w-full" />
                  <p className="text-sm text-gray-600 mt-2">ATS Compatibility Score</p>
                </div>

                {/* Keywords */}
                <div>
                  <h3 className="font-semibold mb-3">Keyword Analysis</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-green-600 mb-2">Found Keywords</p>
                      <div className="flex flex-wrap gap-1">
                        {result.keywords.found.length > 0 ? (
                          result.keywords.found.map((keyword) => (
                            <Badge key={keyword} variant="secondary" className="bg-green-100 text-green-800">
                              {keyword}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">No specific keywords found.</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-600 mb-2">Missing Keywords</p>
                      <div className="flex flex-wrap gap-1">
                        {result.keywords.missing.length > 0 ? (
                          result.keywords.missing.map((keyword) => (
                            <Badge key={keyword} variant="secondary" className="bg-red-100 text-red-800">
                              {keyword}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">All key terms seem to be present!</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Strengths and Improvements */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.strengths.length > 0 ? (
                    result.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No specific strengths identified.</span>
                  )}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">Areas for Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.improvements.length > 0 ? (
                    result.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{improvement}</span>
                      </li>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No specific improvements suggested.</span>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

export default function ResumeScoringPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
        <h2 className="text-xl font-semibold">Loading Resume Scoring...</h2>
        <p className="text-gray-600">Preparing the ATS analysis tool</p>
      </div>
    </div>
  )
}
