"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"
import { Sparkles } from "lucide-react"

export default function ResumeScoringPage() {
  const [jobDescription, setJobDescription] = useState("")
  const [resumeContent, setResumeContent] = useState("")
  const [score, setScore] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleScoreResume = async () => {
    if (!jobDescription || !resumeContent) {
      toast({
        title: "Missing Information",
        description: "Please provide both job description and resume content.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setScore(null)
    setFeedback(null)

    try {
      // Simulate API call to an AI model for resume scoring
      // In a real application, you would send this data to a backend API
      // that interacts with an LLM (e.g., OpenAI, Groq, etc.)
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate network delay

      // Mock scoring logic
      const jdWords = new Set(jobDescription.toLowerCase().match(/\b\w+\b/g))
      const resumeWords = new Set(resumeContent.toLowerCase().match(/\b\w+\b/g))

      let matchedWords = 0
      jdWords.forEach((word) => {
        if (resumeWords.has(word)) {
          matchedWords++
        }
      })

      const calculatedScore = Math.min(100, Math.floor((matchedWords / jdWords.size) * 100))
      setScore(calculatedScore)

      // Mock feedback generation
      let generatedFeedback = ""
      if (calculatedScore >= 80) {
        generatedFeedback =
          "Excellent match! Your resume aligns very well with the job description. Focus on highlighting specific achievements."
      } else if (calculatedScore >= 60) {
        generatedFeedback =
          "Good match. Consider adding more keywords from the job description, especially in the skills and experience sections."
      } else {
        generatedFeedback =
          "There's room for improvement. Tailor your resume more closely to the job description by incorporating relevant keywords and experiences."
      }
      setFeedback(generatedFeedback)

      toast({
        title: "Resume Scored!",
        description: `Your resume scored ${calculatedScore}%.`,
      })
    } catch (error) {
      console.error("Error scoring resume:", error)
      toast({
        title: "Error",
        description: "Failed to score resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">AI Resume Scorer</h1>
      <Card>
        <CardHeader>
          <CardTitle>Get Your Resume Scored</CardTitle>
          <CardDescription>
            Paste your resume and a job description to get an AI-powered compatibility score and feedback.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div>
            <Label htmlFor="job-description" className="mb-2 block">
              Job Description
            </Label>
            <Textarea
              id="job-description"
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={8}
              className="min-h-[150px]"
            />
          </div>
          <div>
            <Label htmlFor="resume-content" className="mb-2 block">
              Your Resume Content
            </Label>
            <Textarea
              id="resume-content"
              placeholder="Paste your resume content here (plain text works best)..."
              value={resumeContent}
              onChange={(e) => setResumeContent(e.target.value)}
              rows={10}
              className="min-h-[200px]"
            />
          </div>
          <Button onClick={handleScoreResume} disabled={loading}>
            {loading ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-pulse" /> Scoring...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Score My Resume
              </>
            )}
          </Button>

          {score !== null && (
            <div className="mt-6 space-y-4">
              <h2 className="text-2xl font-semibold">Your Score:</h2>
              <div className="flex items-center gap-4">
                <Progress value={score} className="w-full" />
                <span className="text-lg font-bold">{score}%</span>
              </div>
              {feedback && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-2">Feedback:</h3>
                    <p className="text-sm text-muted-foreground">{feedback}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
