import { defineConfig } from 'drizzle-kit'

// biome-ignore lint/style/noDefaultExport: Config file
export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'file:database.db'
  },
  verbose: true,
  strict: true
})
