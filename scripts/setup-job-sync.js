import fs from "fs/promises"
import path from "path"
import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

class JobSyncSetup {
  constructor() {
    this.dataDir = path.join(process.cwd(), "data")
    this.logsDir = path.join(process.cwd(), "logs")
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`)
  }

  async checkEnvironment() {
    this.log("Checking environment variables...")
    
    const requiredVars = {
      'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
      'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY
    }
    
    let allGood = true
    for (const [varName, value] of Object.entries(requiredVars)) {
      if (!value) {
        this.log(`Missing environment variable: ${varName}`, 'error')
        allGood = false
      } else {
        this.log(`✅ ${varName} is set`)
      }
    }
    
    return allGood
  }

  async createDirectories() {
    this.log("Creating required directories...")
    
    const directories = [this.dataDir, this.logsDir]
    
    for (const dir of directories) {
      try {
        await fs.mkdir(dir, { recursive: true })
        this.log(`✅ Created directory: ${dir}`)
      } catch (error) {
        this.log(`Failed to create directory ${dir}: ${error.message}`, 'error')
      }
    }
  }

  async testSupabaseConnection() {
    this.log("Testing Supabase connection...")
    
    if (!supabaseUrl || !supabaseServiceKey) {
      this.log("Cannot test Supabase connection - missing environment variables", 'error')
      return false
    }
    
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      // Test connection by listing buckets
      const { data: buckets, error } = await supabase.storage.listBuckets()
      
      if (error) {
        this.log(`Supabase connection failed: ${error.message}`, 'error')
        return false
      }
      
      this.log(`✅ Supabase connection successful`)
      this.log(`Found ${buckets.length} storage buckets`)
      
      // Check if company-jobs bucket exists
      const companyJobsBucket = buckets.find(bucket => bucket.name === 'company-jobs')
      if (companyJobsBucket) {
        this.log(`✅ company-jobs bucket exists`)
      } else {
        this.log(`⚠️ company-jobs bucket not found - you may need to create it`, 'warning')
      }
      
      return true
      
    } catch (error) {
      this.log(`Supabase connection test failed: ${error.message}`, 'error')
      return false
    }
  }

  async checkDatabaseTables() {
    this.log("Checking database tables...")
    
    if (!supabaseUrl || !supabaseServiceKey) {
      this.log("Cannot check database - missing environment variables", 'error')
      return false
    }
    
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      // Test job_notifications table
      const { data: notifications, error } = await supabase
        .from('job_notifications')
        .select('count')
        .limit(1)
      
      if (error) {
        this.log(`job_notifications table check failed: ${error.message}`, 'error')
        this.log("You may need to run the SQL setup scripts", 'warning')
        return false
      }
      
      this.log(`✅ job_notifications table exists`)
      return true
      
    } catch (error) {
      this.log(`Database check failed: ${error.message}`, 'error')
      return false
    }
  }

  async createSampleData() {
    this.log("Creating sample data for testing...")
    
    const sampleData = {
      company: "Sample Company",
      scrapedAt: new Date().toISOString(),
      jobs: [
        {
          id: "sample-job-1",
          title: "Sample Job",
          company: "Sample Company",
          location: "Sample Location",
          url: "https://example.com/job",
          description: "This is a sample job for testing",
          requirements: ["Sample Skill 1", "Sample Skill 2"],
          postedDate: "2024-01-01",
          isActive: true
        }
      ]
    }
    
    try {
      const sampleFile = path.join(this.dataDir, "sample.json")
      await fs.writeFile(sampleFile, JSON.stringify(sampleData, null, 2))
      this.log(`✅ Created sample data file: ${sampleFile}`)
      
      return true
    } catch (error) {
      this.log(`Failed to create sample data: ${error.message}`, 'error')
      return false
    }
  }

  async runSetup() {
    console.log("🔧 Job Sync System Setup")
    console.log("=" * 50)
    
    const results = {
      environment: false,
      directories: false,
      supabase: false,
      database: false,
      sampleData: false
    }
    
    try {
      // Step 1: Check environment
      results.environment = await this.checkEnvironment()
      
      // Step 2: Create directories
      await this.createDirectories()
      results.directories = true
      
      // Step 3: Test Supabase connection
      results.supabase = await this.testSupabaseConnection()
      
      // Step 4: Check database tables
      results.database = await this.checkDatabaseTables()
      
      // Step 5: Create sample data
      results.sampleData = await this.createSampleData()
      
      // Summary
      console.log("\n📊 Setup Summary:")
      console.log("=" * 50)
      
      const checks = [
        { name: "Environment Variables", result: results.environment },
        { name: "Directories", result: results.directories },
        { name: "Supabase Connection", result: results.supabase },
        { name: "Database Tables", result: results.database },
        { name: "Sample Data", result: results.sampleData }
      ]
      
      let allPassed = true
      checks.forEach(check => {
        const status = check.result ? "✅" : "❌"
        console.log(`${status} ${check.name}`)
        if (!check.result) allPassed = false
      })
      
      if (allPassed) {
        console.log("\n🎉 Setup completed successfully!")
        console.log("\nNext steps:")
        console.log("1. Run the SQL setup scripts if database tables are missing")
        console.log("2. Test the sync system: npm run test-sync")
        console.log("3. Set up cron job for automated sync")
        console.log("4. Configure your scraper server to upload to company-jobs bucket")
      } else {
        console.log("\n⚠️ Setup completed with issues")
        console.log("Please address the failed checks above before proceeding")
      }
      
    } catch (error) {
      console.error("❌ Setup failed:", error)
    }
  }
}

// Main execution
async function main() {
  const setup = new JobSyncSetup()
  await setup.runSetup()
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

export default JobSyncSetup 