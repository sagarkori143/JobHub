"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

export default function ResumeScoringPage() {
  const [resumeText, setResumeText] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [score, setScore] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const calculateScore = async () => {
    if (!resumeText || !jobDescription) {
      toast({
        title: "Missing Information",
        description: "Please provide both resume text and job description.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setScore(null)
    setFeedback([])

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock scoring logic
    let mockScore = 0
    const mockFeedback: string[] = []

    const resumeWords = new Set(resumeText.toLowerCase().split(/\W+/).filter(Boolean))
    const jobWords = new Set(jobDescription.toLowerCase().split(/\W+/).filter(Boolean))

    const commonWords = [...resumeWords].filter((word) => jobWords.has(word))
    const uniqueJobWords = [...jobWords].filter((word) => !resumeWords.has(word))

    mockScore = Math.min(100, Math.round((commonWords.length / jobWords.size) * 100))

    if (mockScore < 50) {
      mockFeedback.push("Your resume might be missing key terms from the job description.")
    } else if (mockScore < 75) {
      mockFeedback.push("Good match, but consider adding more specific keywords from the job description.")
    } else {
      mockFeedback.push("Excellent match! Your resume aligns well with the job requirements.")
    }

    if (uniqueJobWords.length > 0) {
      mockFeedback.push(`Consider adding experience related to: ${uniqueJobWords.slice(0, 5).join(", ")}...`)
    }

    if (resumeText.length < 200) {
      mockFeedback.push("Your resume seems a bit short. Ensure you've included enough detail.")
    }

    setScore(mockScore)
    setFeedback(mockFeedback)
    setIsLoading(false)

    toast({
      title: "Scoring Complete",
      description: "Your resume has been scored against the job description.",
    })
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Resume ATS Scoring</h1>
      <p className="text-gray-600 mb-6">
        Paste your resume and a job description to get an ATS compatibility score and feedback.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Resume Text</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={15}
              className="min-h-[200px]"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={15}
              className="min-h-[200px]"
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mb-8">
        <Button onClick={calculateScore} disabled={isLoading || !resumeText || !jobDescription}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculating Score...
            </>
          ) : (
            "Calculate ATS Score"
          )}
        </Button>
      </div>

      {score !== null && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>ATS Score & Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Overall Match Score:</Label>
              <div className="flex items-center gap-4 mt-2">
                <Progress value={score} className="w-full" />
                <span className="text-2xl font-bold">{score}%</span>
              </div>
            </div>
            <div>
              <Label>Feedback:</Label>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {feedback.map((item, index) => (
                  <li key={index} className="flex items-start">
                    {score && score >= 75 ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 mr-2 mt-1 flex-shrink-0" />
                    )}
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
