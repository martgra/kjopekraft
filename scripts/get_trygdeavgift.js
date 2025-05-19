#!/usr/bin/env bun

import fs from 'fs'
import path from 'path'
import { load } from 'cheerio'

async function main() {
  const year = process.argv[2]
  if (!year) {
    console.error('Usage: bun run get_trygdeavgift.js <year>')
    process.exit(1)
  }

  const url = `https://www.skatteetaten.no/satser/trygdeavgift/?year=${year}`
  console.log(`Fetching Trygdeavgift for ${year}…`)
  const res = await fetch(url)
  if (!res.ok) {
    console.error('Failed to fetch:', res.status, res.statusText)
    process.exit(1)
  }
  const html = await res.text()
  const $ = load(html)

  const rows = $('table tbody tr')
  const rates = []
  let lowerLimit = null
  let upperLimitCap = null

  rows.each((_, tr) => {
    const cols = $(tr).find('td')
    if (cols.length === 2) {
      const desc = $(cols[0]).text().trim().replace(/\s+/g, ' ')
      const val = $(cols[1]).text().trim()

      if (/Nedre grense/.test(desc)) {
        lowerLimit = val
      } else if (/Avgiften utgjør aldri/.test(desc)) {
        upperLimitCap = val
      } else {
        rates.push({ description: desc, rate: val })
      }
    }
  })

  const entry = {
    year: Number(year),
    rates,
    lowerLimit,
    upperLimitCap,
    fetchedAt: new Date().toISOString(),
  }

  const outFile = path.resolve('./trygdeavgift.json')
  let existing = []
  if (fs.existsSync(outFile)) {
    try {
      existing = JSON.parse(fs.readFileSync(outFile, 'utf-8'))
      if (!Array.isArray(existing)) existing = []
    } catch {
      console.warn('Warning: could not parse existing JSON, starting fresh.')
      existing = []
    }
  }

  existing.push(entry)
  fs.writeFileSync(outFile, JSON.stringify(existing, null, 2), 'utf-8')
  console.log(`Appended data for ${year} to ${outFile}`)
}

main()
