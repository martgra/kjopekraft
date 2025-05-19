#!/usr/bin/env bun

import { load } from 'cheerio'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const year = process.argv[2] || '2024'
const url = `https://www.skatteetaten.no/en/rates/bracket-tax/?year=${year}#rateShowYear`
const outFile = join(process.cwd(), 'brackets.json')

async function fetchBrackets() {
  const res = await fetch(url)
  const html = await res.text()
  const $ = load(html)

  const brackets = []
  $('table tbody tr').each((i, tr) => {
    const tds = $(tr).find('td')
    const step = $(tds[0]).text().trim() || null
    const range = $(tds[1]).text().trim()
    const rate = $(tds[2]).text().trim()
    brackets.push({ step, range, rate })
  })

  return { year, brackets }
}

;(async () => {
  try {
    const data = await fetchBrackets()

    let arr = []
    if (existsSync(outFile)) {
      const content = readFileSync(outFile, { encoding: 'utf8' })
      arr = JSON.parse(content)
      if (!Array.isArray(arr)) arr = []
    }

    arr.push(data)
    writeFileSync(outFile, JSON.stringify(arr, null, 2))

    console.log(`Appended bracket data for ${year} to ${outFile}`)
  } catch (err) {
    console.error('Error:', err)
    process.exit(1)
  }
})()
