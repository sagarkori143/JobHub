"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"
import { jobIntegrationService } from "@/services/job-integration-service"
import { jobDataService } from "@/services/job-data-service"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

export function JobScraperDashboard() {
  const [scraping, setScraping] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState("")
  const [scrapedCount, setScrapedCount] = useState(0)
  const [addedCount, setAddedCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleScrapeJobs = async () => {
    setScraping(true)
    setProgress(0)
    setStatusMessage("Starting job scraping...")
    setScrapedCount(0)
    setAddedCount(0)
    setError(null)

    try {
      // Simulate scraping process
      setStatusMessage("Fetching jobs from external sources...")
      setProgress(20)
      const newJobs = await jobIntegrationService.fetchJobsFromExternalSources()
      setScrapedCount(newJobs.length)
      setProgress(50)
      setStatusMessage(`Found ${newJobs.length} new jobs. Adding to database...`)

      let jobsAdded = 0
      for (const job of newJobs) {
        try {
          await jobDataService.addJob(job)
          jobsAdded++
          setProgress(50 + (jobsAdded / newJobs.length) * 50)
        } catch (addError) {
          console.error(`Failed to add job ${job.title}:`, addError)
          // Continue even if one job fails to add
        }
      }
      setAddedCount(jobsAdded)
      setProgress(100)
      setStatusMessage(`Scraping complete! Added ${jobsAdded} new jobs.`)
      toast({
        title: "Scraping Successful!",
        description: `Found ${newJobs.length} jobs, added ${jobsAdded} new entries.`,
      })
    } catch (err) {
      console.error("Job scraping failed:", err)
      setError("Failed to scrape jobs. Please check console for details.")
      setStatusMessage("Scraping failed.")
      toast({
        title: "Scraping Failed",
        description: "An error occurred during job scraping.",
        variant: "destructive",
      })
    } finally {
      setScraping(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Job Scraper</CardTitle>
        <CardDescription>Automate fetching new job listings from various sources.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Button onClick={handleScrapeJobs} disabled={scraping}>
          {scraping ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scraping...
            </>
          ) : (
            "Manually Scrape Jobs"
          )}
        </Button>

        {scraping || statusMessage ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">{statusMessage}</p>
            <Progress value={progress} className="w-full" />
            {error && (
              <div className="flex items-center text-red-500 text-sm">
                <XCircle className="h-4 w-4 mr-2" /> {error}
              </div>
            )}
            {!error && !scraping && progress === 100 && (
              <div className="flex items-center text-green-600 text-sm">
                <CheckCircle2 className="h-4 w-4 mr-2" /> All operations completed.
              </div>
            )}
            {(scrapedCount > 0 || addedCount > 0) && (
              <div className="text-sm text-muted-foreground">
                <span>Jobs found: {scrapedCount}</span>
                <span className="ml-4">Jobs added: {addedCount}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Click the button to start a manual job scrape.</p>
        )}

        <div className="mt-4 p-4 border rounded-md bg-muted/50">
          <h3 className="font-semibold text-md mb-2">Automated Scraping</h3>
          <p className="text-sm text-muted-foreground">
            Automated job scraping runs periodically via GitHub Actions. You can view the workflow status in your GitHub
            repository.
          </p>
          <Button variant="link" asChild className="px-0 mt-2">
            <a href="https://github.com/your-repo/actions" target="_blank" rel="noopener noreferrer">
              View GitHub Actions
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
