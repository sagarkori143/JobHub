import puppeteer from "puppeteer"
import { saveJobs, updateScrapingMetadata } from "../services/job-integration-service.js"
const fs = require("fs")
const path = require("path")

const companyConfigs = [
  {
    name: "Google",
    url: "https://careers.google.com/jobs/results/",
    jobSelector: ".gc-card", // Example selector, adjust as needed
    titleSelector: ".gc-card__title",
    companySelector: ".gc-card__company", // Assuming company name is within the card
    locationSelector: ".gc-card__location",
    linkSelector: "a",
    paginationSelector: ".gc-pagination__next", // Example next page button
  },
  {
    name: "Amazon",
    url: "https://www.amazon.jobs/en/job_categories/software-development",
    jobSelector: ".job-tile",
    titleSelector: ".job-title",
    companySelector: ".job-company",
    locationSelector: ".location-text",
    linkSelector: "a",
    paginationSelector: ".pagination-next-button",
  },
  {
    name: "Microsoft",
    url: "https://careers.microsoft.com/v2/global/en/jobs.html",
    jobSelector: ".job-result-card",
    titleSelector: ".job-result-card-title",
    companySelector: ".job-result-card-company",
    locationSelector: ".job-result-card-location",
    linkSelector: "a",
    paginationSelector: ".pagination-next",
  },
  {
    name: "Cisco",
    url: "https://jobs.cisco.com/jobs/search",
    jobSelector: ".job-card",
    titleSelector: ".job-title",
    companySelector: ".job-company",
    locationSelector: ".job-location",
    linkSelector: "a",
    paginationSelector: ".pagination-next-link",
  },
  {
    name: "Apple",
    url: "https://jobs.apple.com/en-us/search?sort=relevance&search=software",
    jobSelector: ".job-row",
    titleSelector: ".job-title",
    companySelector: ".job-company",
    locationSelector: ".job-location",
    linkSelector: "a",
    paginationSelector: ".pagination-next",
  },
  {
    name: "Meta",
    url: "https://www.metacareers.com/jobs/",
    jobSelector: ".job-listing",
    titleSelector: ".job-listing-title",
    companySelector: ".job-listing-company",
    locationSelector: ".job-listing-location",
    linkSelector: "a",
    paginationSelector: ".pagination-next-button",
  },
  {
    name: "Netflix",
    url: "https://jobs.netflix.com/jobs",
    jobSelector: ".job-card",
    titleSelector: ".job-card-title",
    companySelector: ".job-card-company",
    locationSelector: ".job-card-location",
    linkSelector: "a",
    paginationSelector: ".pagination-next",
  },
  {
    name: "Uber",
    url: "https://www.uber.com/careers/list/",
    jobSelector: ".job-listing-card",
    titleSelector: ".job-listing-title",
    companySelector: ".job-listing-company",
    locationSelector: ".job-listing-location",
    linkSelector: "a",
    paginationSelector: ".pagination-next-button",
  },
]

const mockCompanies = ["google", "amazon", "microsoft", "cisco", "apple", "meta", "netflix", "uber"]

async function scrapeCompany(config) {
  console.log(`Starting scrape for ${config.name} at ${config.url}`)
  await updateScrapingMetadata(config.name, "pending", "Scraping in progress...")

  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewport({ width: 1366, height: 768 })

  let allJobs = []
  let currentPage = 1
  let hasNextPage = true

  try {
    while (hasNextPage && currentPage <= 5) {
      // Limit to 5 pages for demonstration
      const url = `${config.url}${config.paginationQuery ? `&page=${currentPage}` : ""}`
      console.log(`Navigating to ${url}`)
      await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 })

      // Wait for job listings to load
      await page.waitForSelector(config.jobSelector, { timeout: 10000 }).catch(() => {
        console.log(`No jobs found on page ${currentPage} for ${config.name}.`)
        hasNextPage = false
      })

      if (!hasNextPage) break

      const jobsOnPage = await page.evaluate((config) => {
        const jobElements = Array.from(document.querySelectorAll(config.jobSelector))
        return jobElements.map((el) => {
          const title = el.querySelector(config.titleSelector)?.textContent.trim() || "N/A"
          const company = el.querySelector(config.companySelector)?.textContent.trim() || config.name
          const location = el.querySelector(config.locationSelector)?.textContent.trim() || "N/A"
          const link = el.querySelector(config.linkSelector)?.href || "#"

          // Basic mock for other fields as they are hard to scrape generically
          const description = `This is a scraped job posting for ${title} at ${company}. More details available on the original link.`
          const requirements = ["See original posting for details"]
          const benefits = ["See original posting for details"]
          const postedDate = new Date().toISOString().split("T")[0] // Today's date
          const experienceLevel = title.toLowerCase().includes("senior")
            ? "Senior"
            : title.toLowerCase().includes("mid")
              ? "Mid"
              : "Entry"
          const remote = location.toLowerCase().includes("remote")
          const industry = "Technology" // Default industry

          return {
            id: `${config.name.toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`,
            title,
            company,
            location,
            type: "Full-time", // Default type
            salary: { min: 50000, max: 150000, currency: "USD" }, // Mock salary
            description,
            requirements,
            benefits,
            postedDate,
            industry,
            experienceLevel,
            remote,
            companyLogo: `/placeholder.svg?height=40&width=40`,
            link,
            scrapedAt: new Date().toISOString(),
            sourceUrl: config.url,
          }
        })
      }, config)

      allJobs = allJobs.concat(jobsOnPage)
      console.log(
        `Scraped ${jobsOnPage.length} jobs from page ${currentPage} for ${config.name}. Total: ${allJobs.length}`,
      )

      // Check for next page
      const nextButton = await page.$(config.paginationSelector)
      if (nextButton) {
        await Promise.all([
          nextButton.click(),
          page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }).catch(() => {
            console.log("Navigation after next button click timed out, but continuing...")
          }),
        ])
        currentPage++
      } else {
        hasNextPage = false
      }
    }

    await saveJobs(config.name, allJobs)
    console.log(`Finished scraping ${config.name}. Total jobs: ${allJobs.length}`)
  } catch (error) {
    console.error(`Error scraping ${config.name}:`, error)
    await updateScrapingMetadata(config.name, "failed", `Scraping failed: ${error.message}`)
  } finally {
    await browser.close()
  }
}

async function scrapeJobs() {
  console.log("Starting job scraping simulation...")
  const allScrapedJobs = []

  for (const company of mockCompanies) {
    try {
      const filePath = path.join(__dirname, `../data/${company}.json`)
      const companyJobs = JSON.parse(fs.readFileSync(filePath, "utf8"))
      console.log(`Simulated scraping ${companyJobs.length} jobs from ${company}.`)
      allScrapedJobs.push(...companyJobs)
    } catch (error) {
      console.error(`Error simulating scraping for ${company}:`, error.message)
    }
  }

  console.log(`Finished scraping simulation. Total jobs scraped: ${allScrapedJobs.length}`)
  return allScrapedJobs
}

export async function runScrapers() {
  console.log("Running all job scrapers...")
  for (const config of companyConfigs) {
    await scrapeCompany(config)
  }
  console.log("All scrapers finished.")
}

// This allows the script to be run directly or imported
if (require.main === module) {
  scrapeJobs()
    .then((jobs) => {
      // Optionally save to a file or process further
      // console.log('Scraped Jobs:', JSON.stringify(jobs, null, 2));
    })
    .catch((error) => {
      console.error("Scraping failed:", error)
      process.exit(1)
    })
}
