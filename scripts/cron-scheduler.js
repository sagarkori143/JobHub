import cron from "node-cron"
import JobScraper from "./job-scraper.js"

console.log("🕐 Job Scraper Cron Scheduler Starting...")

// Schedule job scraping every hour
const cronJob = cron.schedule(
  "0 * * * *",
  async () => {
    console.log("\n⏰ Hourly job scraping triggered at:", new Date().toISOString())

    const scraper = new JobScraper()

    try {
      await scraper.scrapeAll()
      console.log("✅ Scheduled scraping completed successfully")
    } catch (error) {
      console.error("❌ Scheduled scraping failed:", error)
    } finally {
      await scraper.cleanup()
    }
  },
  {
    scheduled: false,
    timezone: "America/New_York",
  },
)

// Start the cron job
cronJob.start()

console.log("✅ Cron job scheduled to run every hour")
console.log("🔄 Next execution will be at the top of the next hour")

// Keep the process alive
process.on("SIGINT", () => {
  console.log("\n🛑 Stopping cron scheduler...")
  cronJob.stop()
  process.exit(0)
})

process.on("SIGTERM", () => {
  console.log("\n🛑 Stopping cron scheduler...")
  cronJob.stop()
  process.exit(0)
})
