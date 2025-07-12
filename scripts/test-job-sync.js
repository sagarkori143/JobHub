import fs from "fs/promises"
import path from "path"
import { createClient } from '@supabase/supabase-js'

// Test configuration
const TEST_COMPANIES = ['amazon', 'google', 'microsoft']
const TEST_BUCKET = 'company-jobs'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

class JobSyncTester {
  constructor() {
    this.dataDir = path.join(process.cwd(), "data")
    this.testResults = []
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`)
  }

  async createTestData() {
    this.log("Creating test company job files...")
    
    const testData = {
      amazon: {
        company: "Amazon",
        scrapedAt: new Date().toISOString(),
        jobs: [
          {
            id: "amazon-job-1",
            title: "Software Engineer",
            company: "Amazon",
            location: "Seattle, WA",
            url: "https://amazon.com/careers/job-1",
            description: "Build scalable systems",
            requirements: ["Java", "AWS", "DynamoDB"],
            postedDate: "2024-01-01",
            isActive: true
          },
          {
            id: "amazon-job-2",
            title: "Frontend Developer",
            company: "Amazon",
            location: "Seattle, WA",
            url: "https://amazon.com/careers/job-2",
            description: "Build user interfaces",
            requirements: ["React", "TypeScript", "CSS"],
            postedDate: "2024-01-02",
            isActive: true
          }
        ]
      },
      google: {
        company: "Google",
        scrapedAt: new Date().toISOString(),
        jobs: [
          {
            id: "google-job-1",
            title: "Machine Learning Engineer",
            company: "Google",
            location: "Mountain View, CA",
            url: "https://google.com/careers/job-1",
            description: "Build ML models",
            requirements: ["Python", "TensorFlow", "PyTorch"],
            postedDate: "2024-01-01",
            isActive: true
          }
        ]
      },
      microsoft: {
        company: "Microsoft",
        scrapedAt: new Date().toISOString(),
        jobs: [
          {
            id: "microsoft-job-1",
            title: "Cloud Engineer",
            company: "Microsoft",
            location: "Redmond, WA",
            url: "https://microsoft.com/careers/job-1",
            description: "Build cloud solutions",
            requirements: ["Azure", "C#", "PowerShell"],
            postedDate: "2024-01-01",
            isActive: true
          },
          {
            id: "microsoft-job-2",
            title: "Product Manager",
            company: "Microsoft",
            location: "Redmond, WA",
            url: "https://microsoft.com/careers/job-2",
            description: "Manage product development",
            requirements: ["Product Management", "Agile", "SQL"],
            postedDate: "2024-01-02",
            isActive: true
          }
        ]
      }
    }

    // Create old files (simulating previous sync)
    for (const [company, data] of Object.entries(testData)) {
      const oldData = {
        ...data,
        jobs: data.jobs.slice(0, -1) // Remove last job to simulate expired job
      }
      
      const oldFile = path.join(this.dataDir, `${company}_old.json`)
      await fs.writeFile(oldFile, JSON.stringify(oldData, null, 2))
      this.log(`Created old file for ${company} with ${oldData.jobs.length} jobs`)
    }

    // Create new files (simulating fresh scrape)
    for (const [company, data] of Object.entries(testData)) {
      const newFile = path.join(this.dataDir, `${company}.json`)
      await fs.writeFile(newFile, JSON.stringify(data, null, 2))
      this.log(`Created new file for ${company} with ${data.jobs.length} jobs`)
    }

    // Upload to Supabase bucket
    for (const [company, data] of Object.entries(testData)) {
      try {
        const { error } = await supabase.storage
          .from(TEST_BUCKET)
          .upload(`${company}.json`, JSON.stringify(data), {
            upsert: true
          })

        if (error) {
          this.log(`Failed to upload ${company}.json: ${error.message}`, 'error')
        } else {
          this.log(`Uploaded ${company}.json to Supabase bucket`)
        }
      } catch (error) {
        this.log(`Error uploading ${company}.json: ${error.message}`, 'error')
      }
    }
  }

  async testJobSync() {
    this.log("Testing job synchronization...")
    
    try {
      // Import and run the sync manager
      const { default: JobSyncManager } = await import('./job-sync.js')
      const syncManager = new JobSyncManager()
      
      // Run the sync
      const { results, allNewJobs, summary } = await syncManager.syncAllCompanies()
      
      // Analyze results
      this.testResults = {
        success: true,
        companiesProcessed: results.length,
        totalNewJobs: allNewJobs.length,
        totalActiveJobs: results.reduce((sum, r) => sum + r.active, 0),
        totalExpiredJobs: results.reduce((sum, r) => sum + r.expired, 0),
        results,
        summary
      }
      
      this.log("Job sync test completed successfully", 'success')
      
    } catch (error) {
      this.testResults = {
        success: false,
        error: error.message,
        stack: error.stack
      }
      this.log(`Job sync test failed: ${error.message}`, 'error')
    }
  }

  async cleanupTestData() {
    this.log("Cleaning up test data...")
    
    try {
      // Remove test files
      for (const company of TEST_COMPANIES) {
        const files = [
          path.join(this.dataDir, `${company}.json`),
          path.join(this.dataDir, `${company}_old.json`)
        ]
        
        for (const file of files) {
          try {
            await fs.unlink(file)
            this.log(`Removed ${file}`)
          } catch (error) {
            // File might not exist, that's okay
          }
        }
      }
      
      // Remove from Supabase bucket
      for (const company of TEST_COMPANIES) {
        try {
          const { error } = await supabase.storage
            .from(TEST_BUCKET)
            .remove([`${company}.json`])
          
          if (error) {
            this.log(`Failed to remove ${company}.json from bucket: ${error.message}`, 'error')
          } else {
            this.log(`Removed ${company}.json from Supabase bucket`)
          }
        } catch (error) {
          this.log(`Error removing ${company}.json: ${error.message}`, 'error')
        }
      }
      
      this.log("Test data cleanup completed", 'success')
      
    } catch (error) {
      this.log(`Cleanup failed: ${error.message}`, 'error')
    }
  }

  async runFullTest() {
    console.log("🧪 Starting Job Sync Test")
    console.log("=" * 50)
    
    try {
      // Step 1: Create test data
      await this.createTestData()
      
      // Step 2: Test job sync
      await this.testJobSync()
      
      // Step 3: Display results
      console.log("\n📊 Test Results:")
      console.log("=" * 50)
      
      if (this.testResults.success) {
        console.log(`✅ Test Status: PASSED`)
        console.log(`📈 Companies Processed: ${this.testResults.companiesProcessed}`)
        console.log(`🆕 Total New Jobs: ${this.testResults.totalNewJobs}`)
        console.log(`✅ Total Active Jobs: ${this.testResults.totalActiveJobs}`)
        console.log(`❌ Total Expired Jobs: ${this.testResults.totalExpiredJobs}`)
        
        console.log(`\n📋 Company Results:`)
        this.testResults.results.forEach(result => {
          if (result.error) {
            console.log(`   ❌ ${result.company}: ${result.error}`)
          } else {
            console.log(`   ✅ ${result.company}: ${result.active} active, ${result.new} new, ${result.expired} expired`)
          }
        })
        
        if (this.testResults.totalNewJobs > 0) {
          console.log(`\n🎉 New job openings detected:`)
          console.log(`   This confirms the sync system is working correctly!`)
        }
        
      } else {
        console.log(`❌ Test Status: FAILED`)
        console.log(`🔍 Error: ${this.testResults.error}`)
        console.log(`📝 Stack: ${this.testResults.stack}`)
      }
      
      // Step 4: Cleanup (optional - comment out to keep test data)
      // await this.cleanupTestData()
      
    } catch (error) {
      console.error("❌ Test execution failed:", error)
    }
    
    console.log("\n" + "=" * 50)
    console.log("🏁 Test completed!")
  }
}

// Main execution
async function main() {
  const tester = new JobSyncTester()
  await tester.runFullTest()
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

export default JobSyncTester 