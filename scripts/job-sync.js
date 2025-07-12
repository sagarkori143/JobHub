const fs = require("fs/promises")
const path = require("path")
const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

class JobSyncManager {
  constructor() {
    this.dataDir = path.join(process.cwd(), "data")
    this.bucketName = "company-jobs" // Supabase bucket for company job files
    this.syncLogs = []
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`
    
    this.syncLogs.push(logMessage)
    
    switch(type) {
      case 'error':
        console.error(`❌ ${message}`)
        break
      case 'success':
        console.log(`✅ ${message}`)
        break
      case 'warning':
        console.warn(`⚠️ ${message}`)
        break
      case 'info':
      default:
        console.log(`ℹ️ ${message}`)
        break
    }
  }

  async downloadCompanyFiles() {
    this.log("Downloading company job files from Supabase bucket...")
    
    try {
      // List all files in the bucket
      const { data: files, error } = await supabase.storage
        .from(this.bucketName)
        .list()

      if (error) {
        throw new Error(`Failed to list bucket files: ${error.message}`)
      }

      this.log(`Found ${files.length} company files in bucket`)

      const downloadedFiles = []
      
      for (const file of files) {
        if (file.name.endsWith('.json')) {
          try {
            // Download file from bucket
            const { data, error } = await supabase.storage
              .from(this.bucketName)
              .download(file.name)

            if (error) {
              this.log(`Failed to download ${file.name}: ${error.message}`, 'error')
              continue
            }

            // Convert blob to text
            const fileContent = await data.text()
            const companyData = JSON.parse(fileContent)
            
            // Save to local data directory
            const localPath = path.join(this.dataDir, file.name)
            await fs.writeFile(localPath, JSON.stringify(companyData, null, 2))
            
            downloadedFiles.push({
              filename: file.name,
              company: companyData.company,
              jobs: companyData.jobs?.length || 0,
              scrapedAt: companyData.scrapedAt
            })
            
            this.log(`Downloaded ${file.name} (${companyData.jobs?.length || 0} jobs)`)
            
          } catch (error) {
            this.log(`Error processing ${file.name}: ${error.message}`, 'error')
          }
        }
      }

      this.log(`Successfully downloaded ${downloadedFiles.length} company files`, 'success')
      return downloadedFiles
      
    } catch (error) {
      this.log(`Failed to download company files: ${error.message}`, 'error')
      throw error
    }
  }

  async compareCompanyJobs(companyName) {
    this.log(`Comparing jobs for ${companyName}...`)
    
    const oldFile = path.join(this.dataDir, `${companyName.toLowerCase()}_old.json`)
    const newFile = path.join(this.dataDir, `${companyName.toLowerCase()}.json`)
    
    try {
      // Check if old file exists
      let oldJobs = []
      try {
        const oldData = await fs.readFile(oldFile, 'utf8')
        const oldCompanyData = JSON.parse(oldData)
        oldJobs = oldCompanyData.jobs || []
        this.log(`Found ${oldJobs.length} old jobs for ${companyName}`)
      } catch (error) {
        this.log(`No old file found for ${companyName}, treating as new company`, 'warning')
      }

      // Read new file
      const newData = await fs.readFile(newFile, 'utf8')
      const newCompanyData = JSON.parse(newData)
      const newJobs = newCompanyData.jobs || []
      
      this.log(`Found ${newJobs.length} new jobs for ${companyName}`)

      // Create job maps for comparison
      const oldJobMap = new Map()
      const newJobMap = new Map()

      oldJobs.forEach(job => {
        const key = `${job.title}-${job.location}-${job.company}`
        oldJobMap.set(key, job)
      })

      newJobs.forEach(job => {
        const key = `${job.title}-${job.location}-${job.company}`
        newJobMap.set(key, job)
      })

      // Find expired jobs (in old but not in new)
      const expiredJobs = []
      for (const [key, job] of oldJobMap) {
        if (!newJobMap.has(key)) {
          expiredJobs.push({
            ...job,
            isActive: false,
            expiredAt: new Date().toISOString()
          })
        }
      }

      // Find new jobs (in new but not in old)
      const newJobOpenings = []
      for (const [key, job] of newJobMap) {
        if (!oldJobMap.has(key)) {
          newJobOpenings.push({
            ...job,
            isActive: true,
            isNew: true,
            addedAt: new Date().toISOString()
          })
        }
      }

      // Find active jobs (in both old and new)
      const activeJobs = []
      for (const [key, job] of newJobMap) {
        if (oldJobMap.has(key)) {
          activeJobs.push({
            ...job,
            isActive: true
          })
        }
      }

      // Combine all jobs
      const allJobs = [...activeJobs, ...newJobOpenings, ...expiredJobs]

      // Create updated company data
      const updatedCompanyData = {
        ...newCompanyData,
        jobs: allJobs,
        syncStats: {
          total: allJobs.length,
          active: activeJobs.length,
          new: newJobOpenings.length,
          expired: expiredJobs.length,
          lastSync: new Date().toISOString()
        }
      }

      // Save updated file
      await fs.writeFile(newFile, JSON.stringify(updatedCompanyData, null, 2))
      
      // IMPORTANT: Preserve current new file as old file for next comparison
      // This ensures we can compare with the upcoming batch
      await fs.writeFile(oldFile, JSON.stringify(newCompanyData, null, 2))
      
      this.log(`${companyName} sync completed:`, 'success')
      this.log(`  - Active jobs: ${activeJobs.length}`)
      this.log(`  - New jobs: ${newJobOpenings.length}`)
      this.log(`  - Expired jobs: ${expiredJobs.length}`)
      this.log(`  - Preserved current file as old file for next comparison`)

      return {
        company: companyName,
        active: activeJobs.length,
        new: newJobOpenings.length,
        expired: expiredJobs.length,
        total: allJobs.length,
        newJobOpenings, // For notification queue
        allJobs // For merged file
      }

    } catch (error) {
      this.log(`Error comparing jobs for ${companyName}: ${error.message}`, 'error')
      return {
        company: companyName,
        active: 0,
        new: 0,
        expired: 0,
        total: 0,
        newJobOpenings: [],
        allJobs: [],
        error: error.message
      }
    }
  }

  async createMergedJobsFile(allJobs) {
    this.log("Creating merged jobs file for portal display...")
    
    try {
      // Sort jobs by newest first (using postedDate or addedAt)
      const sortedJobs = allJobs.sort((a, b) => {
        const dateA = new Date(a.postedDate || a.addedAt || a.createdAt || 0)
        const dateB = new Date(b.postedDate || b.addedAt || b.createdAt || 0)
        return dateB.getTime() - dateA.getTime() // Newest first
      })

      // Create merged data structure
      const mergedData = {
        jobs: sortedJobs,
        totalJobs: sortedJobs.length,
        activeJobs: sortedJobs.filter(job => job.isActive !== false).length,
        lastUpdated: new Date().toISOString(),
        metadata: {
          source: "job-sync-system",
          companies: [...new Set(sortedJobs.map(job => job.company))],
          jobTypes: [...new Set(sortedJobs.map(job => job.type).filter(Boolean))],
          locations: [...new Set(sortedJobs.map(job => job.location).filter(Boolean))]
        }
      }

      // Save merged file
      const mergedFilePath = path.join(this.dataDir, "posts.json")
      await fs.writeFile(mergedFilePath, JSON.stringify(mergedData, null, 2))
      
      this.log(`Created merged jobs file with ${sortedJobs.length} jobs`, 'success')
      this.log(`Jobs sorted by newest first for portal display`)
      
      return mergedData
      
    } catch (error) {
      this.log(`Error creating merged jobs file: ${error.message}`, 'error')
      throw error
    }
  }

  async createSyncMetadata() {
    this.log("Creating sync metadata file...")
    
    try {
      const now = new Date()
      const nextUpdate = new Date(now.getTime() + (2 * 60 * 60 * 1000)) // 2 hours from now
      
      // Round to the nearest 2-hour interval (0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22)
      const hours = nextUpdate.getHours()
      const roundedHours = Math.floor(hours / 2) * 2
      const nextCronUpdate = new Date(nextUpdate)
      nextCronUpdate.setHours(roundedHours, 0, 0, 0)
      
      // If the rounded time is in the past, add 2 hours
      if (nextCronUpdate.getTime() <= now.getTime()) {
        nextCronUpdate.setHours(nextCronUpdate.getHours() + 2)
      }
      
      const syncMetadata = {
        lastSync: now.toISOString(),
        nextSync: nextCronUpdate.toISOString(),
        syncInterval: "2 hours",
        cronSchedule: "0 */2 * * *",
        hasRealData: true,
        totalJobs: 0, // Will be updated by merged data
        companiesProcessed: 0, // Will be updated by sync results
        newJobsFound: 0, // Will be updated by sync results
        expiredJobsFound: 0 // Will be updated by sync results
      }
      
      const metadataPath = path.join(this.dataDir, "sync-metadata.json")
      await fs.writeFile(metadataPath, JSON.stringify(syncMetadata, null, 2))
      
      this.log(`Created sync metadata file with next update at ${nextCronUpdate.toLocaleString()}`)
      
      return syncMetadata
      
    } catch (error) {
      this.log(`Error creating sync metadata: ${error.message}`, 'error')
      throw error
    }
  }

  async syncAllCompanies() {
    this.log("Starting job synchronization for all companies...")
    
    const startTime = new Date()
    const results = []
    const allNewJobs = []
    const allJobsForMerge = []

    try {
      // Download latest company files from Supabase
      const downloadedFiles = await this.downloadCompanyFiles()
      
      if (downloadedFiles.length === 0) {
        this.log("No company files found to sync", 'warning')
        return { results: [], allNewJobs: [], mergedData: null }
      }

      // Compare each company
      for (const file of downloadedFiles) {
        const result = await this.compareCompanyJobs(file.company)
        results.push(result)
        
        if (result.newJobOpenings && result.newJobOpenings.length > 0) {
          allNewJobs.push(...result.newJobOpenings)
        }
        
        if (result.allJobs && result.allJobs.length > 0) {
          allJobsForMerge.push(...result.allJobs)
        }
      }

      // Create merged jobs file for portal display
      const mergedData = await this.createMergedJobsFile(allJobsForMerge)

      // Create/update sync metadata file
      const syncMetadata = await this.createSyncMetadata()
      syncMetadata.totalJobs = mergedData.totalJobs
      syncMetadata.companiesProcessed = results.length
      syncMetadata.newJobsFound = allNewJobs.length
      syncMetadata.expiredJobsFound = results.reduce((sum, r) => sum + r.expired, 0)
      
      // Update the metadata file with actual results
      const metadataPath = path.join(this.dataDir, "sync-metadata.json")
      await fs.writeFile(metadataPath, JSON.stringify(syncMetadata, null, 2))
      
      this.log(`Updated sync metadata with actual results`)

      // Generate sync summary
      const endTime = new Date()
      const duration = Math.round((endTime - startTime) / 1000)
      
      const summary = {
        syncSession: {
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          duration,
          companiesProcessed: results.length,
          totalNewJobs: allNewJobs.length,
          totalActiveJobs: results.reduce((sum, r) => sum + r.active, 0),
          totalExpiredJobs: results.reduce((sum, r) => sum + r.expired, 0),
          totalJobsInPortal: mergedData.totalJobs
        },
        results,
        newJobs: allNewJobs,
        mergedData,
        syncMetadata,
        logs: this.syncLogs
      }

      // Save sync summary
      const summaryFile = path.join(this.dataDir, "job-sync-summary.json")
      await fs.writeFile(summaryFile, JSON.stringify(summary, null, 2))
      
      this.log(`Sync summary saved to: ${summaryFile}`, 'success')

      return { results, allNewJobs, mergedData, summary }

    } catch (error) {
      this.log(`Sync failed: ${error.message}`, 'error')
      throw error
    }
  }

  async addToNotificationQueue(newJobs) {
    if (newJobs.length === 0) {
      this.log("No new jobs to add to notification queue")
      return
    }

    this.log(`Adding ${newJobs.length} new jobs to notification queue...`)
    
    try {
      // Create notification queue entries
      const notifications = newJobs.map(job => ({
        id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        job_id: job.id,
        company: job.company,
        title: job.title,
        location: job.location,
        url: job.url,
        status: 'pending',
        created_at: new Date().toISOString(),
        scheduled_for: new Date().toISOString() // Send immediately
      }))

      // Insert into notifications table
      const { data, error } = await supabase
        .from('job_notifications')
        .insert(notifications)

      if (error) {
        throw new Error(`Failed to insert notifications: ${error.message}`)
      }

      this.log(`Successfully added ${notifications.length} jobs to notification queue`, 'success')
      return notifications

    } catch (error) {
      this.log(`Failed to add to notification queue: ${error.message}`, 'error')
      throw error
    }
  }

  async runFullSync() {
    this.log("🚀 Starting Full Job Synchronization")
    console.log("=" * 60)
    
    try {
      const { results, allNewJobs, mergedData, summary } = await this.syncAllCompanies()
      
      // Add new jobs to notification queue
      if (allNewJobs.length > 0) {
        await this.addToNotificationQueue(allNewJobs)
      }
      
      console.log("\n" + "=" * 60)
      console.log("✅ Job synchronization completed!")
      console.log(`📊 Summary:`)
      console.log(`   Companies processed: ${summary.syncSession.companiesProcessed}`)
      console.log(`   Total new jobs: ${summary.syncSession.totalNewJobs}`)
      console.log(`   Total active jobs: ${summary.syncSession.totalActiveJobs}`)
      console.log(`   Total expired jobs: ${summary.syncSession.totalExpiredJobs}`)
      console.log(`   Total jobs in portal: ${summary.syncSession.totalJobsInPortal}`)
      console.log(`   Duration: ${summary.syncSession.duration} seconds`)
      
      console.log(`\n📋 Company Results:`)
      results.forEach(result => {
        if (result.error) {
          console.log(`   ❌ ${result.company}: ${result.error}`)
        } else {
          console.log(`   ✅ ${result.company}: ${result.active} active, ${result.new} new, ${result.expired} expired`)
        }
      })
      
      if (allNewJobs.length > 0) {
        console.log(`\n🎉 New job openings found:`)
        allNewJobs.slice(0, 5).forEach((job, index) => {
          console.log(`   ${index + 1}. ${job.title} at ${job.company} - ${job.location || 'No location'}`)
        })
        if (allNewJobs.length > 5) {
          console.log(`   ... and ${allNewJobs.length - 5} more`)
        }
      }
      
      console.log(`\n📄 Portal Display:`)
      console.log(`   Merged file created: posts.json`)
      console.log(`   Jobs sorted by newest first`)
      console.log(`   Total jobs available: ${mergedData?.totalJobs || 0}`)
      
    } catch (error) {
      console.error("❌ Synchronization failed:", error)
      process.exit(1)
    }
  }
}

// Main execution
async function main() {
  const syncManager = new JobSyncManager()
  await syncManager.runFullSync()
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
if (require.main === module) {
  main().catch(error => {
    console.error("Fatal error:", error)
    process.exit(1)
  })
}

module.exports = JobSyncManager 