"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, CheckCircle, AlertCircle, XCircle } from "lucide-react"

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
  const [jobDescription, setJobDescription] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<ATSResult | null>(null)

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setResumeFile(file)
      setResult(null)
    }
  }

  const analyzeResume = async () => {
    if (!resumeFile || !jobDescription.trim()) return

    setIsAnalyzing(true)

    // Simulate API call for resume analysis
    setTimeout(() => {
      const mockResult: ATSResult = {
        score: Math.floor(Math.random() * 40) + 60, // 60-100
        strengths: [
          "Strong technical skills section",
          "Relevant work experience highlighted",
          "Clear formatting and structure",
          "Quantified achievements included",
        ],
        improvements: [
          "Add more industry-specific keywords",
          "Include soft skills relevant to the role",
          "Optimize section headers for ATS parsing",
          "Add relevant certifications or training",
        ],
        keywords: {
          found: ["JavaScript", "React", "Node.js", "Python", "SQL", "Git"],
          missing: ["TypeScript", "AWS", "Docker", "Kubernetes", "Agile", "Scrum"],
        },
      }
      setResult(mockResult)
      setIsAnalyzing(false)
    }, 3000)
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Resume ATS Scoring</h1>
        <p className="text-gray-600">
          Upload your resume and job description to get an ATS compatibility score and optimization suggestions.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Resume & Job Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="resume">Resume (PDF)</Label>
              <Input id="resume" type="file" accept=".pdf" onChange={handleResumeUpload} className="mt-1" />
              {resumeFile && (
                <div className="flex items-center space-x-2 mt-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">{resumeFile.name}</span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="jobDescription">Job Description</Label>
              <Textarea
                id="jobDescription"
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={8}
                className="mt-1"
              />
            </div>

            <Button
              onClick={analyzeResume}
              disabled={!resumeFile || !jobDescription.trim() || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
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
          </CardHeader>
          <CardContent>
            {!result && !isAnalyzing && (
              <div className="text-center py-8 text-gray-500">
                Upload your resume and job description to see results
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
                        {result.keywords.found.map((keyword) => (
                          <Badge key={keyword} variant="secondary" className="bg-green-100 text-green-800">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-600 mb-2">Missing Keywords</p>
                      <div className="flex flex-wrap gap-1">
                        {result.keywords.missing.map((keyword) => (
                          <Badge key={keyword} variant="secondary" className="bg-red-100 text-red-800">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results */}
      {result && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-orange-600">Areas for Improvement</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
