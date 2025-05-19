#!/usr/bin/env bun
import fs from 'fs/promises'
import { existsSync } from 'fs'
import { load } from 'cheerio'

async function main() {
  const year = process.argv[2]
  if (!year) {
    console.error('Usage: bun run get_standard_deduction.js <year>')
    process.exit(1)
  }

  const url = `https://www.skatteetaten.no/en/rates/minimum-standard-deduction/?year=${year}`
  const res = await fetch(url)
  if (!res.ok) {
    console.error(`Failed to fetch ${url}: ${res.status}`)
    process.exit(1)
  }
  const html = await res.text()
  const $ = load(html)

  function parseTable(headings) {
    // headings: array of possible first-cell texts (English or Norwegian)
    const table = $('table')
      .filter((i, el) => {
        const firstCell = $(el).find('tr').first().find('td, th').first().text().trim()
        return headings.includes(firstCell)
      })
      .first()

    if (!table.length) {
      throw new Error(`Table not found for headings: ${headings.join(', ')}`)
    }

    const map = {}
    table.find('tr').each((i, row) => {
      const $row = $(row)
      const rawKey = $row.find('td, th').first().text().trim()
      if (!rawKey) return
      const key = rawKey.replace(/\*/g, '').trim()
      const val = $row.find('td').last().text().trim()
      map[key] = val
    })

    // support both English and Norwegian labels
    const rateText = map['Rate'] || map['Sats']
    const upperText = map['Upper limit'] || map['Øvre grense arbeidsinntekt'] || map['Øvre grense']
    const lowerText =
      map['Lower limit'] ||
      map['Nedre grense arbeidsinntekt'] ||
      map['Nedre grense pensjonsinntekt'] ||
      map['Nedre grense']
    const specialText =
      map['Special allowance in employment income'] || map['Særskilt fradrag i arbeidsinntekt']

    if (!rateText || !upperText) {
      throw new Error(`Missing Rate or Upper limit for headings '${headings.join("', '")}'`)
    }

    const rate = parseFloat(rateText.replace('%', '').trim())
    const upper = parseInt(upperText.replace(/[^0-9]/g, ''), 10)
    const lower = lowerText ? parseInt(lowerText.replace(/[^0-9]/g, ''), 10) : undefined
    const specialAllow = specialText ? parseInt(specialText.replace(/[^0-9]/g, ''), 10) : undefined

    return { rate, upper, lower, specialAllow }
  }

  const salaryRaw = parseTable(['Salary', 'Lønn'])
  const pensionRaw = parseTable(['Pension', 'Pensjon'])

  const entry = {
    year: Number(year),
    salary: {
      rate: salaryRaw.rate,
      upperLimit: salaryRaw.upper,
      ...(salaryRaw.lower != null ? { lowerLimit: salaryRaw.lower } : {}),
      ...(salaryRaw.specialAllow != null ? { specialAllowance: salaryRaw.specialAllow } : {}),
    },
    pension: {
      rate: pensionRaw.rate,
      upperLimit: pensionRaw.upper,
      ...(pensionRaw.lower != null ? { lowerLimit: pensionRaw.lower } : {}),
    },
  }

  const file = 'data.json'
  let arr = []
  if (existsSync(file)) {
    try {
      const existing = await fs.readFile(file, 'utf-8')
      arr = JSON.parse(existing)
      if (!Array.isArray(arr)) arr = []
    } catch {
      arr = []
    }
  }

  arr.push(entry)
  await fs.writeFile(file, JSON.stringify(arr, null, 2))

  console.log(`Appended ${year}:`)
  console.log(
    `  • Salary: rate ${salaryRaw.rate}% up to ${salaryRaw.upper}` +
      (salaryRaw.lower ? `, minimum ${salaryRaw.lower}` : '') +
      (salaryRaw.specialAllow ? `, special allowance ${salaryRaw.specialAllow}` : ''),
  )
  console.log(
    `  • Pension: rate ${pensionRaw.rate}% up to ${pensionRaw.upper}` +
      (pensionRaw.lower ? `, minimum ${pensionRaw.lower}` : ''),
  )
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
