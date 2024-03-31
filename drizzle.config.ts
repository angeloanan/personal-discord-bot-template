import { defineConfig } from 'drizzle-kit'

// biome-ignore lint/style/noDefaultExport: Config file
export default defineConfig({
	schema: 'src/db/schema.ts',
	out: 'drizzle',
	driver: 'libsql',
	dbCredentials: {
		url: process.env.DATABASE_URL ?? 'file:database.db',
	},
	verbose: true,
	strict: true
})
