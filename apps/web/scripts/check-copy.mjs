// Usage: with `pnpm --filter ./apps/web dev` running, `node scripts/check-copy.mjs` (compare) or `--update` (save baseline).
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const appDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const baselineDir = path.join(appDir, 'tests', 'copy-baseline')
const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000'
const update = process.argv.includes('--update')

async function mdxRoutes(section) {
  let dir = path.join(appDir, 'src', 'app', section)
  let entries = await readdir(dir, { withFileTypes: true })
  let routes = []
  for (let entry of entries) {
    if (!entry.isDirectory()) continue
    let files = await readdir(path.join(dir, entry.name))
    if (files.includes('page.mdx')) routes.push(`/${section}/${entry.name}`)
  }
  return routes.sort()
}

const entities = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#x27;': "'",
  '&#39;': "'",
  '&nbsp;': ' ',
}

export function extractWords(html) {
  let text =
    html.match(/<main[\s\S]*?<\/main>/)?.[0] ??
    html.match(/<body[\s\S]*?<\/body>/)?.[0] ??
    html
  text = text
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<template[\s\S]*?<\/template>/g, ' ')
  let previous
  do {
    previous = text
    text = text.replace(
      /<(\w+)\b[^>]*\baria-hidden="true"[^>]*>[^<]*<\/\1>/g,
      ' ',
    )
  } while (text !== previous)
  text = text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:amp|lt|gt|quot|#x27|#39|nbsp);/g, (match) => entities[match])
  return text.match(/[\p{L}\p{N}]+(?:['’]\p{L}+)*/gu) ?? []
}

function baselineFile(route) {
  let name = route === '/' ? 'home' : route.slice(1).replaceAll('/', '__')
  return path.join(baselineDir, `${name}.txt`)
}

const routes = [
  '/',
  '/property-management',
  '/renovations',
  '/about',
  '/contact',
  '/blog',
  ...(await mdxRoutes('blog')),
  '/work',
  ...(await mdxRoutes('work')),
  '/this-page-does-not-exist',
]

await mkdir(baselineDir, { recursive: true })

let failures = 0
for (let route of routes) {
  let html
  try {
    html = await (await fetch(new URL(route, baseUrl))).text()
  } catch {
    console.error(
      `Could not reach ${baseUrl}. Start the dev server first: pnpm --filter ./apps/web dev`,
    )
    process.exit(1)
  }
  let words = extractWords(html).join(' ')

  if (update) {
    await writeFile(baselineFile(route), `${words}\n`)
    console.log(`saved ${route}`)
    continue
  }

  let expected = (await readFile(baselineFile(route), 'utf8')).trim()
  if (expected === words) {
    console.log(`ok    ${route}`)
    continue
  }

  failures++
  let a = expected.split(' ')
  let b = words.split(' ')
  let i = 0
  while (i < a.length && a[i] === b[i]) i++
  let from = Math.max(0, i - 8)
  console.log(`FAIL  ${route}`)
  console.log(`  first difference at word ${i}`)
  console.log(`  expected: …${a.slice(from, i + 12).join(' ')}`)
  console.log(`  actual:   …${b.slice(from, i + 12).join(' ')}`)
}

if (failures > 0) {
  console.error(`\n${failures} route(s) changed copy`)
  process.exit(1)
}
