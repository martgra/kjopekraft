// fetch-and-append-rates.js
import { load } from 'cheerio'
import { readFile, writeFile } from 'fs/promises'

async function fetchHtml(year) {
  const url = `https://www.skatteetaten.no/en/rates/general-income/?year=${year}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return res.text()
}

function parseNew(html, year) {
  const $ = load(html)
  const out = { year: Number(year) }
  $('table tr').each((_, tr) => {
    const [labelTd, valueTd] = $(tr).find('td').toArray()
    if (!labelTd || !valueTd) return
    const label = $(labelTd).text().trim()
    const pct = $(valueTd)
      .text()
      .match(/([\d,.]+)\s*percent/)
    if (!pct) return
    const rate = parseFloat(pct[1].replace(',', '.')) / 100
    if (/^Persons$/.test(label)) out.generalIncomeRate = rate
    else if (/Troms and Finnmark/.test(label)) out.regionalIncomeRate = rate
    else if (/arrears/i.test(label)) out.arrearsIncomeRate = rate
  })
  return out
}

function parseOld(html, year) {
  const $ = load(html)
  // older pages use a borderless table, fixed rows:
  const rows = $('table tr')
    .slice(0, 3)
    .toArray()
    .map(tr =>
      $(tr)
        .find('td')
        .toArray()
        .map(td => $(td).text().trim()),
    )
  // rows: [ [ 'Personer', '27,0 prosent' ], [ 'Personer i Finnmark…', '23,5 prosent' ], [ 'Etterskuddspliktige (bedrifter)', '27,0 prosent' ] ]
  const toNum = s => parseFloat(s.replace(',', '.')) / 100
  return {
    year: Number(year),
    generalIncomeRate: toNum(rows[0][1]),
    regionalIncomeRate: toNum(rows[1][1]),
    arrearsIncomeRate: toNum(rows[2][1]),
  }
}

async function getGeneralIncomeRates(year) {
  const html = await fetchHtml(year)
  // decide old vs new by year
  if (Number(year) <= 2015) {
    return parseOld(html, year)
  } else {
    return parseNew(html, year)
  }
}

async function appendRateToFile(year, filePath = './rates.json') {
  const entry = await getGeneralIncomeRates(year)

  let arr = []
  try {
    const buf = await readFile(filePath, 'utf-8')
    arr = JSON.parse(buf)
    if (!Array.isArray(arr)) arr = []
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
    // file doesn't exist: start fresh
  }

  arr.push(entry)
  await writeFile(filePath, JSON.stringify(arr, null, 2) + '\n')
  console.log(`Appended rates for ${year} to ${filePath}`)
}

if (import.meta.main) {
  const year = process.argv[2] || '2025'
  appendRateToFile(year).catch(err => {
    console.error(err)
    process.exit(1)
  })
}
