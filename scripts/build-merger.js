import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function mergeBuildJobs() {
  console.log("🔨 Build-time job merging started...")

  const dataDir = path.join(__dirname, "..", "data")
  const companyFiles = [
    "google.json",
    "amazon.json",
    "microsoft.json",
    "apple.json",
    "meta.json",
    "netflix.json",
    "uber.json",
    "cisco.json",
  ]

  const allJobs = []
  const buildStats = {}

  for (const filename of companyFiles) {
    try {
      const filePath = path.join(dataDir, filename)
      const data = await fs.readFile(filePath, "utf8")
      const jobs = JSON.parse(data)

      // Only include active jobs
      const activeJobs = jobs.filter((job) => job.isActive !== false)
      allJobs.push(...activeJobs)

      const companyName = filename.replace(".json", "")
      buildStats[companyName] = {
        total: jobs.length,
        active: activeJobs.length,
        expired: jobs.length - activeJobs.length,
      }

      console.log(`📊 ${companyName}: ${activeJobs.length} active jobs`)
    } catch (error) {
      console.log(`⚠️  Could not read ${filename}: ${error.message}`)
      const companyName = filename.replace(".json", "")
      buildStats[companyName] = { total: 0, active: 0, expired: 0 }
    }
  }

  // Save merged posts
  const postsFile = path.join(dataDir, "posts.json")
  await fs.writeFile(postsFile, JSON.stringify(allJobs, null, 2))

  // Update build metadata
  const buildMetadata = {
    buildTime: new Date().toISOString(),
    totalActiveJobs: allJobs.length,
    companies: buildStats,
    lastMerge: new Date().toISOString(),
  }

  const metadataFile = path.join(dataDir, "build-metadata.json")
  await fs.writeFile(metadataFile, JSON.stringify(buildMetadata, null, 2))

  console.log(
    `✅ Build merge completed: ${allJobs.length} active jobs from ${Object.keys(buildStats).length} companies`,
  )

  return buildMetadata
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  mergeBuildJobs().catch(console.error)
}

export default mergeBuildJobs
