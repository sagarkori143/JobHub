const { createClient } = require('@supabase/supabase-js')

// Replace with your actual Supabase URL and service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage() {
  try {
    console.log('🔧 Setting up Supabase storage bucket...')
    
    // Create the avatars bucket
    const { data, error } = await supabase.storage.createBucket('avatars', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    })
    
    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Storage bucket already exists')
      } else {
        console.error('❌ Error creating bucket:', error)
        return
      }
    } else {
      console.log('✅ Storage bucket created successfully')
    }
    
    console.log('🎉 Storage setup complete!')
    console.log('You can now upload avatars through the app.')
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

setupStorage() 