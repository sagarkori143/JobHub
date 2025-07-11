// This script simulates a build-time data merger.
// In a real application, this might be part of a build step
// to combine static data or pre-process scraped data before deployment.

const fs = require("fs")
const path = require("path")

const dataDir = path.join(__dirname, "../data")
const outputFilePath = path.join(dataDir, "merged-jobs.json")

async function mergeJobData() {
  console.log("Starting job data merge...")
  const allJobs = []

  const companyFiles = [
    "google.json",
    "amazon.json",
    "microsoft.json",
    "cisco.json",
    "apple.json",
    "meta.json",
    "netflix.json",
    "uber.json",
  ]

  for (const file of companyFiles) {
    const filePath = path.join(dataDir, file)
    try {
      const fileContent = fs.readFileSync(filePath, "utf8")
      const jobs = JSON.parse(fileContent)
      allJobs.push(...jobs)
      console.log(`Merged ${jobs.length} jobs from ${file}`)
    } catch (error) {
      console.error(`Error merging data from ${file}:`, error.message)
    }
  }

  // Deduplicate jobs if necessary (e.g., based on a unique identifier like title + company + location)
  const uniqueJobs = Array.from(
    new Map(allJobs.map((job) => [`${job.title}-${job.company}-${job.location}`, job])).values(),
  )

  fs.writeFileSync(outputFilePath, JSON.stringify(uniqueJobs, null, 2), "utf8")
  console.log(`Merged ${uniqueJobs.length} unique jobs into ${outputFilePath}`)
  return uniqueJobs
}

// This allows the script to be run directly
if (require.main === module) {
  mergeJobData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Data merge failed:", error)
      process.exit(1)
    })
}

module.exports = mergeJobData
