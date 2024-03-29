import { defineConfig } from 'drizzle-kit'

// biome-ignore lint/style/noDefaultExport: Config file
export default defineConfig({
	schema: './db/schema.ts',
	out: './drizzle',
	driver: 'better-sqlite',
	verbose: true,
	strict: true
})
