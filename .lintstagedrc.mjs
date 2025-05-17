// .lintstagedrc.js
const path = require('path')

const buildEslintCommand = (filenames) =>
  `next lint --fix --file ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(' --file ')}`

module.exports = {
  // 1) Run ESLint on your staged JS/TS files:
  '*.{js,jsx,ts,tsx}': [buildEslintCommand],

  // 2) Run Prettier on JS/TS & markdown:
  '*.{js,jsx,ts,tsx,md,mdx}': ['bunx prettier --write'],

  // 3) Run Prettier on JSON/YAML/CSS/HTML:
  '*.{json,yml,yaml,css,scss,html}': ['bunx prettier --write'],
}
