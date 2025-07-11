import type { JobListing } from "@/types/job-search"
import fs from "fs/promises"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data")
const POSTS_FILE = path.join(DATA_DIR, "posts.json")
const METADATA_FILE = path.join(DATA_DIR, "scraping-metadata.json")

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

export async function saveJobs(companyName: string, jobs: JobListing[]): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    const filePath = path.join(DATA_DIR, `${companyName.toLowerCase()}.json`)
    await fs.writeFile(filePath, JSON.stringify(jobs, null, 2))
    console.log(`Saved ${jobs.length} jobs for ${companyName} to ${filePath}`)
    await updateScrapingMetadata(companyName, "success", `Successfully scraped ${jobs.length} jobs.`)
  } catch (error) {
    console.error(`Failed to save jobs for ${companyName}:`, error)
    await updateScrapingMetadata(
      companyName,
      "failed",
      `Error saving jobs: ${error instanceof Error ? error.message : String(error)}`,
    )
    throw error
  }
}

export async function loadJobs(companyName: string): Promise<JobListing[]> {
  try {
    const filePath = path.join(DATA_DIR, `${companyName.toLowerCase()}.json`)
    const data = await fs.readFile(filePath, "utf-8")
    return JSON.parse(data) as JobListing[]
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.warn(`No job data found for ${companyName}.`)
      return []
    }
    console.error(`Failed to load jobs for ${companyName}:`, error)
    throw error
  }
}

export async function mergeAllCompanyJobs(): Promise<JobListing[]> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    const files = await fs.readdir(DATA_DIR)
    const companyFiles = files.filter(
      (file) => file.endsWith(".json") && file !== "posts.json" && file !== "scraping-metadata.json",
    )

    let allJobs: JobListing[] = []
    for (const file of companyFiles) {
      const filePath = path.join(DATA_DIR, file)
      try {
        const data = await fs.readFile(filePath, "utf-8")
        const companyJobs: JobListing[] = JSON.parse(data)
        allJobs = allJobs.concat(companyJobs)
      } catch (error) {
        console.error(`Error reading or parsing ${file}:`, error)
      }
    }

    // Filter out expired jobs for the main posts.json
    const activeJobs = allJobs.filter((job) => !job.expired)

    await fs.writeFile(POSTS_FILE, JSON.stringify(activeJobs, null, 2))
    console.log(`Merged ${activeJobs.length} active jobs into ${POSTS_FILE}`)
    return activeJobs
  } catch (error) {
    console.error("Failed to merge all company jobs:", error)
    throw error
  }
}

export async function loadAllMergedJobs(): Promise<JobListing[]> {
  try {
    const data = await fs.readFile(POSTS_FILE, "utf-8")
    return JSON.parse(data) as JobListing[]
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.warn(`Merged posts.json not found. Returning empty array.`)
      return []
    }
    console.error(`Failed to load merged jobs from ${POSTS_FILE}:`, error)
    throw error
  }
}

export async function getScrapingMetadata(): Promise<ScrapingMetadata> {
  try {
    const data = await fs.readFile(METADATA_FILE, "utf-8")
    return JSON.parse(data) as ScrapingMetadata
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { lastScraped: null, companies: {} }
    }
    console.error("Failed to load scraping metadata:", error)
    throw error
  }
}

export async function updateScrapingMetadata(
  companyName: string,
  status: "success" | "failed" | "pending",
  message?: string,
): Promise<void> {
  try {
    const metadata = await getScrapingMetadata()
    const now = new Date().toISOString()

    metadata.lastScraped = now
    metadata.companies[companyName] = {
      lastScraped: now,
      lastSuccessfulScrape: status === "success" ? now : metadata.companies[companyName]?.lastSuccessfulScrape || null,
      status,
      message,
    }

    await fs.writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2))
  } catch (error) {
    console.error("Failed to update scraping metadata:", error)
    throw error
  }
}

export async function initializeScrapingMetadata(companyNames: string[]): Promise<void> {
  try {
    const metadata = await getScrapingMetadata()
    let changed = false
    companyNames.forEach((company) => {
      if (!metadata.companies[company]) {
        metadata.companies[company] = {
          lastScraped: null,
          lastSuccessfulScrape: null,
          status: "pending",
        }
        changed = true
      }
    })
    if (changed) {
      await fs.writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2))
      console.log("Initialized scraping metadata for new companies.")
    }
  } catch (error) {
    console.error("Failed to initialize scraping metadata:", error)
    throw error
  }
}
