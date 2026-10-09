// Usage: `node scripts/cutout-icons.mjs <out-dir> <image>...` — turns white-background
// generated icons into transparent, de-fringed PNGs that sit on any band colour.
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const SIZE = 384
// Near-white, near-neutral pixels count as background. Cream (#fdf5e8) has a
// channel spread of ~21, so the spread limit keeps cream artwork opaque.
const MIN_CHANNEL = 236
const MAX_SPREAD = 14
// Enclosed white regions (e.g. the hole in a map pin) smaller than this are
// treated as artwork highlights rather than background.
const MIN_ENCLOSED = 1500
const FRINGE = 2

function isWhiteish(data, i) {
  let r = data[i]
  let g = data[i + 1]
  let b = data[i + 2]
  return (
    Math.min(r, g, b) >= MIN_CHANNEL && Math.max(r, g, b) - Math.min(r, g, b) <= MAX_SPREAD
  )
}

function backgroundMask(data, width, height) {
  let n = width * height
  let mask = new Uint8Array(n)
  let seen = new Uint8Array(n)
  let stack = new Int32Array(n)

  for (let start = 0; start < n; start++) {
    if (seen[start] || !isWhiteish(data, start * 3)) continue
    let top = 0
    let component = []
    let touchesEdge = false
    stack[top++] = start
    seen[start] = 1
    while (top) {
      let p = stack[--top]
      component.push(p)
      let x = p % width
      let y = (p - x) / width
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) touchesEdge = true
      for (let q of [p - 1, p + 1, p - width, p + width]) {
        if (q < 0 || q >= n || seen[q]) continue
        if ((q === p - 1 && x === 0) || (q === p + 1 && x === width - 1)) continue
        if (!isWhiteish(data, q * 3)) continue
        seen[q] = 1
        stack[top++] = q
      }
    }
    if (touchesEdge || component.length >= MIN_ENCLOSED) {
      for (let p of component) mask[p] = 1
    }
  }
  return mask
}

function dilate(mask, width, height, radius) {
  let out = mask.slice()
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (mask[y * width + x]) continue
      search: for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          let nx = x + dx
          let ny = y + dy
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
          if (mask[ny * width + nx]) {
            out[y * width + x] = 2
            break search
          }
        }
      }
    }
  }
  return out
}

async function cutout(file, outDir) {
  let { data, info } = await sharp(file)
    .removeAlpha()
    .resize(SIZE, SIZE, { fit: 'contain', background: '#ffffff' })
    .raw()
    .toBuffer({ resolveWithObject: true })
  let { width, height } = info
  let regions = dilate(backgroundMask(data, width, height), width, height, FRINGE)
  let rgba = Buffer.alloc(width * height * 4)

  for (let p = 0; p < width * height; p++) {
    let [r, g, b] = [data[p * 3], data[p * 3 + 1], data[p * 3 + 2]]
    let alpha = 255
    if (regions[p] === 1) {
      alpha = 0
    } else if (regions[p] === 2) {
      // Colour-to-alpha against white: un-composites anti-aliased edge pixels.
      let a = Math.max(255 - r, 255 - g, 255 - b) / 255
      alpha = Math.round(a * 255)
      if (a > 0) {
        r = Math.round((r - 255 * (1 - a)) / a)
        g = Math.round((g - 255 * (1 - a)) / a)
        b = Math.round((b - 255 * (1 - a)) / a)
      }
    }
    rgba.set([r, g, b, alpha], p * 4)
  }

  let name = path.basename(file).replace(/\.[^.]+$/, '.png')
  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .trim({ threshold: 0 })
    .png({ compressionLevel: 9, palette: false })
    .toFile(path.join(outDir, name))
  return name
}

let [outDir, ...files] = process.argv.slice(2)
if (!outDir || files.length === 0) {
  console.error('Usage: node scripts/cutout-icons.mjs <out-dir> <image>...')
  process.exit(1)
}
await mkdir(outDir, { recursive: true })
for (let file of files) console.log(await cutout(file, outDir))
