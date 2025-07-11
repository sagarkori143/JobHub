// This file would typically run on a server or a dedicated cron job service.
// In a Next.js App Router context, this logic would be part of a Server Action
// or an API Route that is triggered by an external cron service (e.g., Vercel Cron Jobs).

// For demonstration purposes, this file shows how you might import and run the scraper.
// It's not directly executable in the browser-based Next.js environment as a cron job.

import { runScrapers } from "./job-scraper.js"
import { mergeAllCompanyJobs } from "../services/job-integration-service.js"
import { emailService } from "../services/email-service.js" // Import email service

async function scheduledJob() {
  console.log("Cron job started: Running scrapers and merging jobs...")
  try {
    await runScrapers() // Execute all scrapers
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
