import { boolean, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const userProfiles = pgTable('user_profiles', {
  userId: text('user_id').primaryKey(),
  timezone: text('timezone').notNull(),
  aiEnabled: boolean('ai_enabled').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const creditsDaily = pgTable('credits_daily', {
  userId: text('user_id').notNull(),
  dateKey: text('date_key').notNull(),
  used: integer('used').notNull().default(0),
  limit: integer('limit').notNull().default(10),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const creditsLedger = pgTable('credits_ledger', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: text('user_id').notNull(),
  dateKey: text('date_key').notNull(),
  feature: text('feature').notNull(),
  cost: integer('cost').notNull(),
  requestId: text('request_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
