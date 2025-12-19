#!/usr/bin/env node
/**
 * Apply Better Auth migration to the database
 *
 * This script reads the migration SQL file and applies it to the database.
 * It can be run locally or in production environments.
 *
 * Usage:
 *   bun run scripts/apply-better-auth-migration.ts
 *   or
 *   node --import tsx scripts/apply-better-auth-migration.ts
 */

import { Pool } from 'pg'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

async function applyMigration() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    console.error('❌ DATABASE_URL is not set')
    process.exit(1)
  }

  const pool = new Pool({ connectionString })

  try {
    // Read migration files from better-auth_migrations directory
    const migrationsDir = join(process.cwd(), 'better-auth_migrations')
    const files = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort() // Apply migrations in chronological order

    if (files.length === 0) {
      console.log('⚠️  No migration files found')
      return
    }

    console.log(`📁 Found ${files.length} migration file(s)`)

    for (const file of files) {
      const filePath = join(migrationsDir, file)
      const sql = readFileSync(filePath, 'utf-8')

      console.log(`\n🔄 Applying migration: ${file}`)

      // Execute the migration SQL
      await pool.query(sql)

      console.log(`✅ Successfully applied: ${file}`)
    }

    console.log('\n✨ All migrations applied successfully!')
  } catch (error) {
    if (error instanceof Error) {
      // Check if the error is because tables already exist
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Tables already exist, skipping migration')
      } else {
        console.error('❌ Migration failed:', error.message)
        process.exit(1)
      }
    } else {
      console.error('❌ Migration failed:', error)
      process.exit(1)
    }
  } finally {
    await pool.end()
  }
}

applyMigration()
