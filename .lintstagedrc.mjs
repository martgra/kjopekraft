// .lintstagedrc.mjs
// Next.js 16: Use ESLint directly instead of deprecated `next lint`

export default {
  // 1) Run ESLint on staged JS/TS files
  '*.{js,jsx,ts,tsx}': ['eslint --fix'],

  // 2) Run Prettier on JS/TS & markdown
  '*.{js,jsx,ts,tsx,md,mdx}': ['prettier --write'],

  // 3) Run Prettier on JSON/YAML/CSS/HTML
  '*.{json,yml,yaml,css,scss,html}': ['prettier --write'],
}
