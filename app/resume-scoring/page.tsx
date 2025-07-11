"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Loader2, FileText } from "lucide-react"
import * as pdfjsLib from "pdfjs-dist"

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js"

async function extractTextFromPDF(file: File) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let fullText = ""
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const { items } = await page.getTextContent()
    fullText += items.map((item: any) => item.str).join(" ") + "\n"
  }
  return fullText
}

interface AnalysisResult {
  score: number
  strengths: string[]
  improvements: string[]
  keywords: { found: string[]; missing: string[] }
}

export default function ResumeScoringPage() {
  const [resumeText, setResumeText] = useState("")
  const [jobDesc, setJobDesc] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAnalyze() {
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const res = await fetch("/api/score-resume", {
        method: "POST",
        body: JSON.stringify({ resumeText, jobDescription: jobDesc }),
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Unknown error")
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type === "application/pdf") {
      const text = await extractTextFromPDF(file)
      setResumeText(text)
    } else {
      const text = await file.text()
      setResumeText(text)
    }
  }

  return (
    <main className="container mx-auto py-8">
      {/* INPUT CARD */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Resume & Job Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Resume Side */}
            <div className="flex-1 space-y-3">
              <label className="font-medium">Resume</label>
              <Textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste resume text here…"
                className="min-h-[200px]"
              />
              <Input type="file" accept=".pdf,.txt,.md" onChange={handleFile} />
            </div>

            {/* Job Description Side */}
            <div className="flex-1 space-y-3">
              <label className="font-medium">Job Description</label>
              <Textarea
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                placeholder="Paste job description here…"
                className="min-h-[200px]"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleAnalyze} disabled={loading || !resumeText.trim() || !jobDesc.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Analyze Resume
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* RESULT CARD */}
      {result && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl">Analysis Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-3xl font-bold">
              Compatibility Score: <span className="text-green-600">{result.score}</span>
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Strengths</h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Areas for Improvement</h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.improvements.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Keywords — Found</h3>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.found.map((k, i) => (
                    <span key={i} className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Keywords — Missing</h3>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.missing.map((k, i) => (
                    <span key={i} className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-800">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && <p className="mt-6 text-center text-red-600 font-medium">{error}</p>}
    </main>
  )
}
