"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { jobDataService } from "@/services/job-data-service"
import { Play, RefreshCw, CheckCircle, XCircle, Clock, Building, Database, Calendar, AlertTriangle } from "lucide-react"

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
  const [jobStats, setJobStats] = useState<any>(null)
  const [metadata, setMetadata] = useState<any>(null)
  const { toast } = useToast()

  // Load job statistics on component mount
  useEffect(() => {
    loadJobStats()
  }, [])

  const loadJobStats = async () => {
    try {
      await jobDataService.loadJobs()
      const stats = jobDataService.getStats()
      const meta = jobDataService.getMetadata()

      setJobStats(stats)
      setMetadata(meta)
    } catch (error) {
      console.error("Error loading job stats:", error)
    }
  }

  const startScraping = async () => {
    setIsRunning(true)
    setProgress(0)

    toast({
      title: "Scraping Started",
      description: "This will trigger the actual job scraper. Check your terminal for progress.",
    })

    try {
      // In a real implementation, this would trigger the actual scraper
      // For now, we'll simulate the process and show instructions

      const companies = ["Google", "Amazon", "Microsoft", "Apple", "Meta", "Netflix", "Uber", "Cisco"]
      const session: ScrapingSession = {
        timestamp: new Date().toISOString(),
        totalCompanies: companies.length,
        results: [],
      }

      setCurrentSession(session)

      // Simulate scraping process
      for (let i = 0; i < companies.length; i++) {
        const company = companies[i]

        session.results.push({
          company,
          jobsFound: 0,
          status: "running",
          scrapedAt: new Date().toISOString(),
        })
        setCurrentSession({ ...session })

        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Simulate completion
        session.results[i] = {
          company,
          jobsFound: Math.floor(Math.random() * 25) + 10,
          status: "success",
          scrapedAt: new Date().toISOString(),
        }

        setCurrentSession({ ...session })
        setProgress(((i + 1) / companies.length) * 100)
      }

      session.totalJobs = session.results.reduce((sum, result) => sum + result.jobsFound, 0)
      setCurrentSession(null)
      setIsRunning(false)

      toast({
        title: "Scraping Simulation Completed!",
        description: `To run real scraping, use: npm run scrape-jobs`,
      })

      // Refresh job stats
      await loadJobStats()
    } catch (error) {
      setIsRunning(false)
      toast({
        title: "Scraping Failed",
        description: "An error occurred during the scraping process.",
        variant: "destructive",
      })
    }
  }

  const triggerRealScraping = () => {
    toast({
      title: "Real Scraping Instructions",
      description: "Run 'npm run scrape-jobs' in your terminal to start real job scraping.",
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
            onClick={triggerRealScraping}
            className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
          >
            <Database className="w-4 h-4 mr-2" />
            Run Real Scraper
          </Button>
          <Button onClick={startScraping} disabled={isRunning} variant="outline">
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Simulating...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Simulate Scraping
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Instructions Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
            <span>Real Scraping Commands</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="font-medium text-blue-800">One-time scraping:</p>
              <code className="bg-blue-100 px-2 py-1 rounded text-sm">npm run scrape-jobs</code>
            </div>
            <div>
              <p className="font-medium text-blue-800">Start hourly cron job:</p>
              <code className="bg-blue-100 px-2 py-1 rounded text-sm">npm run start-cron</code>
            </div>
            <div>
              <p className="font-medium text-blue-800">Build-time merge:</p>
              <code className="bg-blue-100 px-2 py-1 rounded text-sm">npm run merge-jobs</code>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Job Statistics */}
      {jobStats && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-green-600" />
                <span>Current Job Data</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Jobs</p>
                    <p className="text-2xl font-bold text-green-600">{jobStats.totalJobs}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Companies</p>
                    <p className="text-2xl font-bold text-blue-600">{Object.keys(jobStats.companies || {}).length}</p>
                  </div>
                </div>
                {jobStats.lastUpdated && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Last updated: {new Date(jobStats.lastUpdated).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Company Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {Object.entries(jobStats.companies || {}).map(([company, stats]: [string, any]) => (
                  <div key={company} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="font-medium capitalize">{company}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {stats.active || 0} active
                      </Badge>
                      {stats.expired > 0 && (
                        <Badge variant="outline" className="text-gray-600">
                          {stats.expired} expired
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {Object.keys(jobStats.companies || {}).length === 0 && (
                  <p className="text-center text-gray-500 text-sm">No company data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
