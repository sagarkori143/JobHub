import JobSyncManager from './job-sync.js'
import fs from "fs/promises"
import path from "path"

class CronJobSync {
  constructor() {
    this.logsDir = path.join(process.cwd(), "logs")
    this.syncManager = new JobSyncManager()
  }

  async setupLogging() {
    // Ensure logs directory exists
    await fs.mkdir(this.logsDir, { recursive: true })
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const logFile = path.join(this.logsDir, `job-sync-${timestamp}.log`)
    
    // Redirect console output to file
    const originalLog = console.log
    const originalError = console.error
    const originalWarn = console.warn
    
    const logStream = await fs.open(logFile, 'w')
    
    console.log = (...args) => {
      const message = args.join(' ') + '\n'
      logStream.write(message)
      originalLog(...args)
    }
    
    console.error = (...args) => {
      const message = args.join(' ') + '\n'
      logStream.write(message)
      originalError(...args)
    }
    
    console.warn = (...args) => {
      const message = args.join(' ') + '\n'
      logStream.write(message)
      originalWarn(...args)
    }
    
    return logStream
  }

  async runCronJob() {
    const startTime = new Date()
    console.log(`🚀 Cron Job Started at ${startTime.toISOString()}`)
    console.log("=" * 60)
    
    let logStream
    try {
      // Setup logging
      logStream = await this.setupLogging()
      
      // Run the sync
      await this.syncManager.runFullSync()
      
      const endTime = new Date()
      const duration = Math.round((endTime - startTime) / 1000)
      
      console.log(`\n✅ Cron Job Completed Successfully`)
      console.log(`⏱️ Total Duration: ${duration} seconds`)
      console.log(`📅 Started: ${startTime.toISOString()}`)
      console.log(`📅 Finished: ${endTime.toISOString()}`)
      
    } catch (error) {
      console.error(`❌ Cron Job Failed: ${error.message}`)
      console.error(`Stack trace: ${error.stack}`)
      
      // Log error details
      const errorLog = {
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack,
        type: 'CRON_JOB_ERROR'
      }
      
      const errorFile = path.join(this.logsDir, `cron-error-${Date.now()}.json`)
      await fs.writeFile(errorFile, JSON.stringify(errorLog, null, 2))
      
      process.exit(1)
    } finally {
      if (logStream) {
        await logStream.close()
      }
    }
  }
}

// Main execution for cron
async function main() {
  const cronJob = new CronJobSync()
  await cronJob.runCronJob()
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Received SIGINT, shutting down gracefully...")
  process.exit(0)
})

process.on("SIGTERM", async () => {
  console.log("\n🛑 Received SIGTERM, shutting down gracefully...")
  process.exit(0)
})

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error("Fatal error:", error)
    process.exit(1)
  })
}

export default CronJobSync 