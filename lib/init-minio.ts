/**
 * MinIO Initialization Script
 * Run this script to initialize MinIO with the default bucket
 * Usage: npx tsx lib/init-minio.ts
 */

import { initializeMinio } from './minio'

async function main() {
  console.log('🚀 Initializing MinIO...')

  try {
    await initializeMinio()
    console.log('✅ MinIO initialization completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ MinIO initialization failed:', error)
    process.exit(1)
  }
}

main()
