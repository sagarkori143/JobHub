"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Play, RefreshCw, Download, CheckCircle, XCircle, Clock, Building, Database, Calendar } from "lucide-react"

interface ScrapingResult {
  company: string
  jobsFound: number
  status: "success" | "error" | "running"
  error?: string
  scrapedAt: string
}

interface ScrapingSession {
  timestamp: string
  totalCompanies: number
  results: ScrapingResult[]
  totalJobs?: number
}

export function JobScraperDashboard() {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentSession, setCurrentSession] = useState<ScrapingSession | null>(null)
  const [lastSession, setLastSession] = useState<ScrapingSession | null>(null)
  const [scrapedJobs, setScrapedJobs] = useState<any[]>([])
  const { toast } = useToast()

  // Load last scraping session on component mount
  useEffect(() => {
    loadLastSession()
    loadScrapedJobs()
  }, [])

  const loadLastSession = async () => {
    try {
      // In a real app, this would fetch from your API or file system
      // For demo, we'll simulate loading saved data
      const savedSession = localStorage.getItem("lastScrapingSession")
      if (savedSession) {
        setLastSession(JSON.parse(savedSession))
      }
    } catch (error) {
      console.error("Error loading last session:", error)
    }
  }

  const loadScrapedJobs = async () => {
    try {
      // In a real app, this would load from your scraped jobs file
      const savedJobs = localStorage.getItem("scrapedJobs")
      if (savedJobs) {
        setScrapedJobs(JSON.parse(savedJobs))
      }
    } catch (error) {
      console.error("Error loading scraped jobs:", error)
    }
  }

  const startScraping = async () => {
    setIsRunning(true)
    setProgress(0)

    const companies = ["Google", "Amazon", "Microsoft", "Cisco"]
    const session: ScrapingSession = {
      timestamp: new Date().toISOString(),
      totalCompanies: companies.length,
      results: [],
    }

    setCurrentSession(session)

    toast({
      title: "Scraping Started",
      description: "Beginning to scrape job data from company career pages...",
    })

    // Simulate scraping process
    for (let i = 0; i < companies.length; i++) {
      const company = companies[i]

      // Update current session with running status
      session.results.push({
        company,
        jobsFound: 0,
        status: "running",
        scrapedAt: new Date().toISOString(),
      })
      setCurrentSession({ ...session })

      // Simulate scraping delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate results
      const jobsFound = Math.floor(Math.random() * 15) + 5
      const success = Math.random() > 0.1 // 90% success rate

      session.results[i] = {
        company,
        jobsFound: success ? jobsFound : 0,
        status: success ? "success" : "error",
        error: success ? undefined : "Failed to connect to career page",
        scrapedAt: new Date().toISOString(),
      }

      setCurrentSession({ ...session })
      setProgress(((i + 1) / companies.length) * 100)
    }

    // Calculate total jobs
    session.totalJobs = session.results.reduce((sum, result) => sum + result.jobsFound, 0)

    // Save session
    localStorage.setItem("lastScrapingSession", JSON.stringify(session))
    setLastSession(session)
    setCurrentSession(null)
    setIsRunning(false)

    // Generate mock scraped jobs
    const mockScrapedJobs = generateMockScrapedJobs(session.totalJobs)
    localStorage.setItem("scrapedJobs", JSON.stringify(mockScrapedJobs))
    setScrapedJobs(mockScrapedJobs)

    toast({
      title: "Scraping Completed!",
      description: `Successfully scraped ${session.totalJobs} jobs from ${session.results.filter((r) => r.status === "success").length} companies.`,
    })
  }

  const generateMockScrapedJobs = (totalJobs: number) => {
    const companies = ["Google", "Amazon", "Microsoft", "Cisco"]
    const titles = [
      "Software Engineer",
      "Product Manager",
      "Data Scientist",
      "UX Designer",
      "DevOps Engineer",
      "Machine Learning Engineer",
      "Frontend Developer",
      "Backend Developer",
      "Full Stack Developer",
      "Cloud Architect",
    ]

    return Array.from({ length: totalJobs }, (_, i) => ({
      id: `scraped-${Date.now()}-${i}`,
      title: titles[Math.floor(Math.random() * titles.length)],
      company: companies[Math.floor(Math.random() * companies.length)],
      location: ["San Francisco, CA", "Seattle, WA", "Remote"][Math.floor(Math.random() * 3)],
      scrapedAt: new Date().toISOString(),
      source: "career_page_scraper",
    }))
  }

  const exportData = () => {
    if (scrapedJobs.length === 0) {
      toast({
        title: "No Data to Export",
        description: "Run a scraping session first to generate data.",
        variant: "destructive",
      })
      return
    }

    const dataStr = JSON.stringify(scrapedJobs, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `scraped-jobs-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Data Exported",
      description: "Scraped job data has been downloaded as JSON file.",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "running":
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Job Scraper Dashboard</h2>
          <p className="text-gray-600">Automatically scrape jobs from company career pages</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={startScraping}
            disabled={isRunning}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Scraping...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Scraping
              </>
            )}
          </Button>
          <Button onClick={exportData} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {isRunning && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Scraping Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Session */}
      {currentSession && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
              <span>Current Scraping Session</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {currentSession.results.map((result) => (
                <div key={result.company} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{result.company}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(result.status)}
                    {result.status === "success" && <Badge variant="secondary">{result.jobsFound} jobs</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Session Results */}
      {lastSession && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-green-600" />
                <span>Last Scraping Session</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Jobs Found</p>
                    <p className="text-2xl font-bold text-green-600">{lastSession.totalJobs || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Companies Scraped</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {lastSession.results.filter((r) => r.status === "success").length}/{lastSession.totalCompanies}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Last run: {new Date(lastSession.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Company Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lastSession.results.map((result) => (
                  <div key={result.company} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">{result.company}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {result.status === "success" ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {result.jobsFound} jobs
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Failed</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Scraped Jobs Preview */}
      {scrapedJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recently Scraped Jobs ({scrapedJobs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {scrapedJobs.slice(0, 10).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-2 border rounded text-sm">
                  <div>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-gray-600">
                      {job.company} • {job.location}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {new Date(job.scrapedAt).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
              {scrapedJobs.length > 10 && (
                <p className="text-center text-gray-500 text-sm">... and {scrapedJobs.length - 10} more jobs</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
