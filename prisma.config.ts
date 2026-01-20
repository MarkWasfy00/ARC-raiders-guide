import * as dotenv from 'dotenv'
import * as path from 'path'
import { defineConfig } from 'prisma/config'

// Load .env file explicitly from the project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') })


const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set')
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: databaseUrl,
  },
})
