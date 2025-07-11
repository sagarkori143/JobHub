import fs from "fs/promises"
import path from "path"

// Company career page configurations
const COMPANY_CONFIGS = [
  {
    name: "Google",
    url: "https://www.google.com/about/careers/applications/jobs/results",
    selectors: {
      jobContainer: ".gc-card",
      title: ".gc-card__title",
      location: ".gc-card__location",
      department: ".gc-card__department",
      link: "a",
    },
    baseUrl: "https://www.google.com",
  },
  {
    name: "Amazon",
    url: "http://amazon.jobs/en/search?base_query=&loc_query=",
    selectors: {
      jobContainer: ".job-tile",
      title: ".job-title",
      location: ".location-and-id",
      department: ".job-category",
      link: "a",
    },
    baseUrl: "https://amazon.jobs",
  },
  {
    name: "Microsoft",
    url: "https://jobs.careers.microsoft.com/global/en/search?l=en_us&pg=1&pgSz=20&o=Relevance&flt=true",
    selectors: {
      jobContainer: ".jobs-list-item",
      title: ".job-title",
      location: ".job-location",
      department: ".job-category",
      link: "a",
    },
    baseUrl: "https://jobs.careers.microsoft.com",
  },
  {
    name: "Cisco",
    url: "https://jobs.cisco.com/jobs/SearchJobs/?listFilterMode=1",
    selectors: {
      jobContainer: ".data-row",
      title: ".jobTitle-link",
      location: ".jobLocation",
      department: ".jobDepartment",
      link: "a",
    },
    baseUrl: "https://jobs.cisco.com",
  },
]

// Mock scraping function (in real implementation, you'd use puppeteer or similar)
async function scrapeCompanyJobs(config) {
  console.log(`Scraping jobs from ${config.name}...`)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Mock job data based on company
  const mockJobs = generateMockJobsForCompany(config.name)

  console.log(`Found ${mockJobs.length} jobs from ${config.name}`)
  return mockJobs
}

function generateMockJobsForCompany(companyName) {
  const jobTitles = {
    Google: [
      "Senior Software Engineer - Search",
      "Product Manager - Cloud",
      "Data Scientist - AI/ML",
      "UX Designer - Maps",
      "Site Reliability Engineer",
      "Software Engineer - Android",
    ],
    Amazon: [
      "Software Development Engineer",
      "Product Manager - AWS",
      "Data Engineer - Alexa",
      "Frontend Engineer - Prime",
      "DevOps Engineer",
      "Machine Learning Engineer",
    ],
    Microsoft: [
      "Software Engineer - Azure",
      "Program Manager - Office",
      "Data Scientist - Bing",
      "Cloud Solution Architect",
      "Full Stack Developer",
      "AI Research Engineer",
    ],
    Cisco: [
      "Network Software Engineer",
      "Security Engineer",
      "Cloud Infrastructure Engineer",
      "Systems Engineer",
      "Software Developer - Networking",
      "Technical Solutions Engineer",
    ],
  }

  const locations = ["San Francisco, CA", "Seattle, WA", "New York, NY", "Austin, TX", "Remote", "Boston, MA"]
  const departments = ["Engineering", "Product", "Data Science", "Design", "Security", "Cloud"]

  return (
    jobTitles[companyName]?.map((title, index) => ({
      id: `${companyName.toLowerCase()}-${Date.now()}-${index}`,
      title,
      company: companyName,
      location: locations[Math.floor(Math.random() * locations.length)],
      department: departments[Math.floor(Math.random() * departments.length)],
      type: Math.random() > 0.8 ? "Part-time" : "Full-time",
      salary: {
        min: 100000 + Math.floor(Math.random() * 50000),
        max: 150000 + Math.floor(Math.random() * 100000),
        currency: "USD",
      },
      description: `Join ${companyName} as a ${title}. We're looking for talented individuals to help us build the future of technology. This role offers exciting challenges and the opportunity to work with cutting-edge technologies.`,
      requirements: [
        `Bachelor's degree in Computer Science or related field`,
        `3+ years of experience in software development`,
        `Strong programming skills in modern languages`,
        `Experience with cloud technologies`,
        `Excellent problem-solving abilities`,
      ],
      benefits: [
        "Competitive salary and equity",
        "Comprehensive health benefits",
        "Flexible work arrangements",
        "Professional development opportunities",
        "Generous PTO policy",
      ],
      postedDate: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000))
        .toISOString()
        .split("T")[0],
      applicationDeadline: new Date(Date.now() + Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))
        .toISOString()
        .split("T")[0],
      industry: "Technology",
      experienceLevel: ["Mid", "Senior"][Math.floor(Math.random() * 2)],
      remote: Math.random() > 0.6,
      companyLogo: `/placeholder.svg?height=40&width=40`,
      scrapedAt: new Date().toISOString(),
      source: "career_page_scraper",
    })) || []
  )
}

async function scrapeAllCompanies() {
  console.log("Starting job scraping process...")

  const allJobs = []
  const scrapingResults = {
    timestamp: new Date().toISOString(),
    totalCompanies: COMPANY_CONFIGS.length,
    results: [],
  }

  for (const config of COMPANY_CONFIGS) {
    try {
      const jobs = await scrapeCompanyJobs(config)
      allJobs.push(...jobs)

      scrapingResults.results.push({
        company: config.name,
        jobsFound: jobs.length,
        status: "success",
        scrapedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error(`Error scraping ${config.name}:`, error.message)
      scrapingResults.results.push({
        company: config.name,
        jobsFound: 0,
        status: "error",
        error: error.message,
        scrapedAt: new Date().toISOString(),
      })
    }
  }

  // Save scraped jobs to JSON file
  const dataDir = path.join(process.cwd(), "data")

  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }

  // Save all scraped jobs
  await fs.writeFile(path.join(dataDir, "scraped-jobs.json"), JSON.stringify(allJobs, null, 2))

  // Save scraping results/metadata
  await fs.writeFile(path.join(dataDir, "scraping-results.json"), JSON.stringify(scrapingResults, null, 2))

  // Update the main mock jobs file by merging with existing data
  try {
    const existingJobsPath = path.join(process.cwd(), "data", "mock-jobs.ts")
    const existingJobs = await import("../data/mock-jobs.ts").then((m) => m.mockJobs).catch(() => [])

    // Remove old scraped jobs and add new ones
    const filteredExistingJobs = existingJobs.filter((job) => job.source !== "career_page_scraper")
    const updatedJobs = [...filteredExistingJobs, ...allJobs]

    // Write updated jobs file
    const jobsFileContent = `import type { JobListing } from "@/types/job-search"

export const mockJobs: JobListing[] = ${JSON.stringify(updatedJobs, null, 2)}
`

    await fs.writeFile(existingJobsPath, jobsFileContent)
  } catch (error) {
    console.error("Error updating mock jobs file:", error.message)
  }

  console.log(`\n✅ Scraping completed!`)
  console.log(`📊 Total jobs scraped: ${allJobs.length}`)
  console.log(`🏢 Companies processed: ${scrapingResults.totalCompanies}`)
  console.log(`📁 Data saved to: data/scraped-jobs.json`)

  return {
    jobs: allJobs,
    results: scrapingResults,
  }
}

// Run the scraper
scrapeAllCompanies().catch(console.error)
