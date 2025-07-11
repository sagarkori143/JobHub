"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { FileText, CheckCircle, AlertCircle, XCircle, Sparkles, Loader2, Upload, ChevronDown } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import * as pdfjs from "pdfjs-dist"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { mockJobs } from "@/data/mock-jobs" // Assuming mockJobs is suitable for client-side use

// Set up PDF.js worker path (served with correct MIME type)
pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.js"

interface ATSResult {
  score: number
  strengths: string[]
  improvements: string[]
  keywords: {
    found: string[]
    missing: string[]
  }
}

export default function ResumeScoringPage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeText, setResumeText] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<ATSResult | null>(null)
  const resumeFileInputRef = useRef<HTMLInputElement>(null)

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjs.getDocument(arrayBuffer).promise
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
      setResumeText("") // Clear text if file is uploaded
      setResult(null)

      if (file.type === "application/pdf") {
        try {
          setIsAnalyzing(true) // Indicate that PDF parsing is happening
          const extractedText = await extractTextFromPdf(file)
          setResumeText(extractedText)
          toast({
            title: "PDF Parsed",
            description: "Text extracted from your resume PDF.",
          })
        } catch (error) {
          console.error("Error parsing PDF:", error)
          toast({
            title: "PDF Parsing Failed",
            description: "Could not extract text from PDF. Please try pasting text directly.",
            variant: "destructive",
          })
          setResumeFile(null)
          setResumeText("")
        } finally {
          setIsAnalyzing(false)
        }
      } else if (file.type === "text/plain") {
        const reader = new FileReader()
        reader.onload = (e) => {
          setResumeText(e.target?.result as string)
          toast({
            title: "Text File Loaded",
            description: "Content extracted from your text file.",
          })
        }
        reader.readAsText(file)
      } else {
        toast({
          title: "Unsupported File Type",
          description: "Please upload a PDF or plain text file.",
          variant: "destructive",
        })
        setResumeFile(null)
        setResumeText("")
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
      toast({
        title: "Missing Information",
        description: "Please provide either resume text/file and job description.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setResult(null)

    try {
      const response = await fetch("/api/score-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeText: finalResumeContent, jobDescription }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch ATS score.")
      }

      const data: ATSResult = await response.json()
      setResult(data)

      toast({
        title: "Resume Scored!",
        description: `Your resume scored ${data.score}%.`,
      })
    } catch (error: any) {
      console.error("Error scoring resume:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to score resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
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

  return (
    <div className="space-y-8 p-4 md:p-0">
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
                <Label htmlFor="resume-file">Upload Resume (PDF or TXT)</Label>
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
                  {resumeFile ? resumeFile.name : "Choose File"}
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

          <Button
            onClick={analyzeResume}
            disabled={(!resumeText.trim() && !resumeFile) || !jobDescription.trim() || isAnalyzing}
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
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card>
        <CardHeader>
          <CardTitle>ATS Analysis Results</CardTitle>
          <CardDescription>Detailed insights from the AI analysis.</CardDescription>
        </CardHeader>
        <CardContent>
          {!result && !isAnalyzing && (
            <div className="text-center py-8 text-gray-500">
              Provide your resume and job description to see AI-powered results.
            </div>
          )}

          {isAnalyzing && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Analyzing your resume...</p>
            </div>
          )}

          {result && (
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
          )}
        </CardContent>
      </Card>
      {/* Detailed Results */}
      {result && (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
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
      )}
    </div>
  )
}
