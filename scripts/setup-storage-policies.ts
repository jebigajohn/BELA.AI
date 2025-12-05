/**
 * Script to create Storage bucket policies via Supabase API
 * Run with: npx tsx scripts/setup-storage-policies.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

// Extract project ref from URL
const projectRef = supabaseUrl.replace('https://', '').split('.')[0]

async function createStoragePolicies() {
  console.log('🔒 Creating storage policies...\n')
  console.log('Project:', projectRef)

  // We need to use the Management API for this
  // But since we can't easily do that, let's output instructions instead

  console.log('\n📋 Storage Policies müssen manuell erstellt werden:\n')
  console.log(
    '1. Gehe zu: https://supabase.com/dashboard/project/' +
      projectRef +
      '/storage/buckets'
  )
  console.log('2. Für jeden Bucket, klick "Policies" und füge hinzu:\n')

  const buckets = [
    { name: 'profile-photos', public: false },
    { name: 'hero-photos', public: true },
    { name: 'nail-inspo', public: true },
    { name: 'staff-photos', public: true },
    { name: 'customer-photos', public: false },
  ]

  for (const bucket of buckets) {
    console.log(`\n=== ${bucket.name} ===`)

    if (bucket.public) {
      console.log('SELECT Policy (für alle):')
      console.log('  Name: "Public read access"')
      console.log('  Target roles: public')
      console.log('  Policy: true')
    }

    console.log('\nINSERT/UPDATE/DELETE Policies (für Admins):')
    console.log('  Name: "Admin full access"')
    console.log('  Target roles: authenticated')
    console.log('  Policy:')
    console.log('    EXISTS (')
    console.log('      SELECT 1 FROM public.studio_members')
    console.log('      WHERE profile_id = auth.uid()')
    console.log("      AND role = 'admin'")
    console.log('    )')
  }

  console.log(
    '\n\n✨ Alternativ: Aktiviere einfach "Allow public access" für die public buckets'
  )
  console.log(
    '   und lass die private buckets ohne policies (nur via Service Role Key zugänglich)'
  )
}

createStoragePolicies()
