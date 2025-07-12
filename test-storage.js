const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testStorage() {
  try {
    console.log('🔍 Testing storage bucket...')
    
    // Try to list buckets
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.error('❌ Error listing buckets:', error)
      return
    }
    
    console.log('📦 Available buckets:')
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (${bucket.public ? 'public' : 'private'})`)
    })
    
    const avatarsBucket = buckets.find(b => b.name === 'avatars')
    
    if (avatarsBucket) {
      console.log('✅ Avatars bucket found!')
      console.log(`   Name: ${avatarsBucket.name}`)
      console.log(`   Public: ${avatarsBucket.public}`)
    } else {
      console.log('❌ Avatars bucket not found')
      console.log('Please create the bucket using the Supabase dashboard')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testStorage() 