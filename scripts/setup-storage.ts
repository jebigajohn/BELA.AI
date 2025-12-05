/**
 * Script to create Supabase Storage buckets
 * Run with: npx tsx scripts/setup-storage.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    '❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local'
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
})

const buckets = [
  { id: 'profile-photos', public: false, fileSizeLimit: 5 * 1024 * 1024 },
  { id: 'hero-photos', public: true, fileSizeLimit: 10 * 1024 * 1024 },
  { id: 'nail-inspo', public: true, fileSizeLimit: 5 * 1024 * 1024 },
  { id: 'staff-photos', public: true, fileSizeLimit: 5 * 1024 * 1024 },
  { id: 'customer-photos', public: false, fileSizeLimit: 5 * 1024 * 1024 },
]

async function createBuckets() {
  console.log('🪣 Creating storage buckets...\n')

  for (const bucket of buckets) {
    const { data, error } = await supabase.storage.createBucket(bucket.id, {
      public: bucket.public,
      fileSizeLimit: bucket.fileSizeLimit,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    })

    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`✅ ${bucket.id} (already exists)`)
      } else {
        console.error(`❌ ${bucket.id}: ${error.message}`)
      }
    } else {
      console.log(`✅ ${bucket.id} created (public: ${bucket.public})`)
    }
  }

  console.log('\n✨ Done!')
}

createBuckets()
