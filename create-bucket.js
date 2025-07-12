const { createClient } = require('@supabase/supabase-js')

// Get environment variables from .env.local
const fs = require('fs')
const path = require('path')

// Read .env.local file
const envPath = path.join(__dirname, '.env.local')
let envContent = ''

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8')
}

// Parse environment variables
const envVars = {}
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim()
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

console.log('🔧 Supabase URL:', supabaseUrl ? 'Found' : 'Missing')
console.log('🔑 Service Key:', supabaseServiceKey ? 'Found' : 'Missing')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.log('Please check your .env.local file has:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createBucket() {
  try {
    console.log('🚀 Creating avatars storage bucket...')
    
    // First, let's check if the bucket already exists
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError)
      return
    }
    
    console.log('📦 Existing buckets:')
    existingBuckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (${bucket.public ? 'public' : 'private'})`)
    })
    
    const avatarsBucket = existingBuckets.find(b => b.name === 'avatars')
    
    if (avatarsBucket) {
      console.log('✅ Avatars bucket already exists!')
      console.log(`   Name: ${avatarsBucket.name}`)
      console.log(`   Public: ${avatarsBucket.public}`)
      return
    }
    
    // Create the bucket
    const { data, error } = await supabase.storage.createBucket('avatars', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    })
    
    if (error) {
      console.error('❌ Error creating bucket:', error)
      console.log('Error details:', error.message)
      return
    }
    
    console.log('✅ Avatars bucket created successfully!')
    console.log('📋 Bucket details:', data)
    
    // Verify the bucket was created
    const { data: verifyBuckets } = await supabase.storage.listBuckets()
    const newBucket = verifyBuckets.find(b => b.name === 'avatars')
    
    if (newBucket) {
      console.log('🎉 Bucket verification successful!')
      console.log(`   Name: ${newBucket.name}`)
      console.log(`   Public: ${newBucket.public}`)
      console.log('✨ You can now upload avatars through the app!')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

createBucket() 