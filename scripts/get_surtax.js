// get-surtax.js
import { readFileSync, writeFileSync, existsSync } from 'fs'
import fetch from 'node-fetch'
import { load } from 'cheerio'

async function fetchSurtax(year) {
  const url = `https://www.skatteetaten.no/en/rates/surtax/?year=${year}#rateShowYear`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  const html = await res.text()
  const $ = load(html)

  // Find the surtax table
  const rows = $('table tbody tr')
  const data = []
  let currentStage = 'Tax-free amount'

  rows.each((i, tr) => {
    const cells = $(tr)
      .find('td')
      .map((_, td) => $(td).text().trim())
      .get()
    if (cells[0].toLowerCase().includes('tax-free')) {
      currentStage = 'Tax-free amount'
      // skip, since no rate/income in that row
    } else if (cells[0].toLowerCase().includes('stage')) {
      currentStage = cells[0]
    } else if (cells[1] && cells[2]) {
      // a data row under currentStage
      data.push({
        stage: currentStage,
        rate: cells[1],
        income_from: cells[2],
      })
    }
  })

  // Also grab the footnote about Nord-Troms / Finnmark if present
  const footnote = $('p')
    .filter((_, p) => $(p).text().includes('Nord-Troms'))
    .first()
    .text()
    .trim()

  return { year: Number(year), stages: data, note: footnote }
}

async function main() {
  const year = process.argv[2]
  if (!year) {
    console.error('Usage: bun get-surtax.js <year>')
    process.exit(1)
  }

  const entry = await fetchSurtax(year)

  const file = 'surtax.json'
  let all = []
  if (existsSync(file)) {
    try {
      all = JSON.parse(readFileSync(file, 'utf-8'))
      if (!Array.isArray(all)) throw new Error('Not an array')
    } catch {
      console.error('Warning: corrupt surtax.json, overwriting.')
      all = []
    }
  }

  // Avoid duplicates
  if (!all.find(e => e.year === entry.year)) {
    all.push(entry)
    writeFileSync(file, JSON.stringify(all, null, 2))
    console.log(`Appended surtax data for ${year}`)
  } else {
    console.log(`Data for ${year} already exists in ${file}`)
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
