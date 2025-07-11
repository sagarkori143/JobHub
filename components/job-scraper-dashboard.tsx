"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ScrapingMetadata {
  lastScraped: string | null
  companies: {
    [companyName: string]: {
      lastScraped: string | null
      lastSuccessfulScrape: string | null
      status: "success" | "failed" | "pending"
      message?: string
    }
  }
}

// Mock API calls for demonstration
const mockFetchScrapingMetadata = async (): Promise<ScrapingMetadata> => {
  await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
  const storedMetadata = localStorage.getItem("scrapingMetadata")
  if (storedMetadata) {
    return JSON.parse(storedMetadata)
  }
  return {
    lastScraped: null,
    companies: {
      Google: { lastScraped: null, lastSuccessfulScrape: null, status: "pending" },
      Amazon: { lastScraped: null, lastSuccessfulScrape: null, status: "pending" },
      Microsoft: { lastScraped: null, lastSuccessfulScrape: null, status: "pending" },
      Cisco: { lastScraped: null, lastSuccessfulScrape: null, status: "pending" },
      Apple: { lastScraped: null, lastSuccessfulScrape: null, status: "pending" },
      Meta: { lastScraped: null, lastSuccessfulScrape: null, status: "pending" },
      Netflix: { lastScraped: null, lastSuccessfulScrape: null, status: "pending" },
      Uber: { lastScraped: null, lastSuccessfulScrape: null, status: "pending" },
    },
  }
}

const mockRunScraper = async (companyName: string): Promise<void> => {
  const metadata = await mockFetchScrapingMetadata()
  metadata.companies[companyName] = {
    ...metadata.companies[companyName],
    status: "pending",
    message: "Scraping started...",
    lastScraped: new Date().toISOString(),
  }
  localStorage.setItem("scrapingMetadata", JSON.stringify(metadata))

  // Simulate scraping process
  await new Promise((resolve) => setTimeout(resolve, 3000 + Math.random() * 2000)) // 3-5 seconds

  const success = Math.random() > 0.1 // 90% success rate
  metadata.companies[companyName].status = success ? "success" : "failed"
  metadata.companies[companyName].message = success ? "Scraped successfully!" : "Failed to scrape jobs."
  if (success) {
    metadata.companies[companyName].lastSuccessfulScrape = new Date().toISOString()
  }
  metadata.lastScraped = new Date().toISOString()
  localStorage.setItem("scrapingMetadata", JSON.stringify(metadata))
}

export function JobScraperDashboard() {
  const [metadata, setMetadata] = useState<ScrapingMetadata | null>(null)
  const [loadingCompany, setLoadingCompany] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchMetadata = async () => {
    const data = await mockFetchScrapingMetadata()
    setMetadata(data)
  }

  useEffect(() => {
    fetchMetadata()
    const interval = setInterval(fetchMetadata, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const handleRunScraper = async (companyName: string) => {
    setLoadingCompany(companyName)
    toast({
      title: `Scraping ${companyName}`,
      description: "Please wait while we fetch the latest job postings.",
    })
    try {
      await mockRunScraper(companyName)
      toast({
        title: `Scraping ${companyName} Complete`,
        description: "Job postings updated successfully!",
      })
    } catch (error) {
      toast({
        title: `Scraping ${companyName} Failed`,
        description: `There was an error scraping jobs for ${companyName}.`,
        variant: "destructive",
      })
    } finally {
      setLoadingCompany(null)
      fetchMetadata() // Refresh metadata after attempt
    }
  }

  if (!metadata) {
    return <div className="text-center py-10">Loading scraper dashboard...</div>
  }

  const totalCompanies = Object.keys(metadata.companies).length
  const successfulScrapes = Object.values(metadata.companies).filter((c) => c.status === "success").length
  const progress = totalCompanies > 0 ? (successfulScrapes / totalCompanies) * 100 : 0

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Job Scraper Dashboard</h1>
      <p className="text-gray-600 mb-6">Monitor and manually trigger job scraping for various companies.</p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Overall Scraping Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm font-medium">
              {successfulScrapes}/{totalCompanies} successful
            </span>
          </div>
          <Progress value={progress} className="w-full" />
          {metadata.lastScraped && (
            <p className="text-sm text-gray-500 mt-2">
              Last overall scrape: {new Date(metadata.lastScraped).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(metadata.companies).map(([companyName, companyData]) => (
          <Card key={companyName}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">{companyName}</CardTitle>
              {companyData.status === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
              {companyData.status === "failed" && <XCircle className="h-5 w-5 text-red-500" />}
              {companyData.status === "pending" && <Clock className="h-5 w-5 text-yellow-500 animate-spin" />}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">Status: {companyData.status}</p>
              {companyData.lastScraped && (
                <p className="text-xs text-gray-500">
                  Last attempt: {new Date(companyData.lastScraped).toLocaleString()}
                </p>
              )}
              {companyData.lastSuccessfulScrape && (
                <p className="text-xs text-gray-500">
                  Last success: {new Date(companyData.lastSuccessfulScrape).toLocaleString()}
                </p>
              )}
              {companyData.message && <p className="text-xs text-gray-700 mt-2 italic">{companyData.message}</p>}
              <Button
                onClick={() => handleRunScraper(companyName)}
                className="mt-4 w-full"
                disabled={loadingCompany === companyName}
              >
                {loadingCompany === companyName ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Run Scraper
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
