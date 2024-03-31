import { sqliteTable } from 'drizzle-orm/sqlite-core'

export const todo = sqliteTable('todo', {})

export type Todo = typeof todo.$inferSelect
