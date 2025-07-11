"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

type Analysis = {
  score: number
  strengths: string[]
  improvements: string[]
  keywords: { found: string[]; missing: string[] }
}

export default function ResumeScoringPage() {
  const [resumeText, setResumeText] = useState("")
  const [jobDesc, setJobDesc] = useState("")
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function analyzeResume() {
    setLoading(true)
    setAnalysis(null)
    setError(null)
    try {
      const res = await fetch("/api/score-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription: jobDesc }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Analysis failed")
      setAnalysis(data as Analysis)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold">Resume ATS Scoring</h1>

      {/* INPUTS */}
      <Card>
        <CardHeader>
          <CardTitle>Provide Your Resume &amp; Job Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Resume */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="resume">Resume Text</Label>
              <Textarea
                id="resume"
                placeholder="Paste your resume here…"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="min-h-[200px]"
              />
            </div>

            {/* Job Description */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="job">Job Description</Label>
              <Textarea
                id="job"
                placeholder="Paste the job description here…"
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                className="min-h-[200px]"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={analyzeResume} disabled={loading || !resumeText || !jobDesc}>
              {loading ? "Analyzing…" : "Analyze"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* RESULTS */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-lg font-medium">Compatibility&nbsp;Score:</span>
              <span className="text-3xl font-bold text-green-600">{analysis.score}</span>
              <span>/ 100</span>
            </div>

            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-semibold">Strengths</h3>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold">Improvements</h3>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.improvements.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>

            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-semibold">Keywords Found</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywords.found.map((k) => (
                    <span key={k} className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700">
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold">Keywords Missing</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywords.missing.map((k) => (
                    <span key={k} className="rounded-full bg-rose-100 px-3 py-1 text-sm text-rose-700">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && <p className="text-center text-sm text-red-600">{error}</p>}
    </main>
  )
}
