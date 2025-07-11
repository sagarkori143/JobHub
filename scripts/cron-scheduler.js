// This file would typically run on a server or a dedicated cron job service.
// In a Next.js App Router context, this logic would be part of a Server Action
// or an API Route that is triggered by an external cron service (e.g., Vercel Cron Jobs).

// For demonstration purposes, this file shows how you might import and run the scraper.
// It's not directly executable in the browser-based Next.js environment as a cron job.

const scrapeJobs = require("./job-scraper")
const { jobDataService } = require("../services/job-data-service") // Assuming jobDataService can be imported in Node.js
const { mergeAllCompanyJobs } = require("../services/job-integration-service.js")
const { emailService } = require("../services/email-service.js") // Import email service

async function scheduledJob() {
  console.log("Cron job started: Running scrapers and merging jobs...")
  try {
    const newJobs = await scrapeJobs() // Execute all scrapers
    console.log(`Scraped ${newJobs.length} new jobs.`)

    // In a real scenario, you'd compare these new jobs with existing ones
    // and only add truly new ones or update existing ones.
    // For this simulation, we'll just log them or add a few.

    // Example: Add a few new jobs to the mock data store
    for (let i = 0; i < Math.min(5, newJobs.length); i++) {
      const job = newJobs[i]
      // Ensure unique ID for simulation purposes if adding to a persistent store
      job.id = `scheduled-${job.company}-${Date.now()}-${i}`
      job.datePosted = new Date().toISOString().split("T")[0] // Set current date
      job.status = "Wishlist" // New jobs are typically in wishlist
      await jobDataService.addJob(job) // Add to our in-memory store
      console.log(`Added simulated job: ${job.title} at ${job.company}`)
    }

    await mergeAllCompanyJobs() // Merge all scraped jobs into posts.json

    // Simulate sending new job alerts after scraping and merging
    // In a real scenario, you'd compare new jobs with old ones to find truly new ones
    // For this simulation, we'll just trigger some alerts based on mock data
    console.log("Triggering new job alerts simulation...")
    emailService.sendNewJobAlerts() // This will use its internal mockNewJobs

    console.log("Cron job finished successfully.")
  } catch (error) {
    console.error("Cron job failed:", error)
  }
}

// This would be triggered by an external cron service.
// For local testing, you might call it manually or via a simple script.
// Example: `node scripts/cron-scheduler.js`
scheduledJob()

module.exports = { scheduledJob }
