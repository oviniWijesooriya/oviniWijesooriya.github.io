// Encoding, naming and image helpers for the admin.

export function bytesToBase64(bytes) {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(binary)
}

export const base64ToBytes = (b64) => Uint8Array.from(atob(b64.replace(/\s/g, '')), (c) => c.charCodeAt(0))

export const textToBase64 = (text) => bytesToBase64(new TextEncoder().encode(text))

export const slugify = (value) =>
  value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)

/** Inverse of parseFrontmatter. Empty values are left out. */
export function toMarkdownFile(data, body) {
  const lines = Object.entries(data)
    .filter(([, v]) => v !== '' && v !== false && v !== undefined && v !== null)
    .map(([k, v]) => {
      let value = String(v).replace(/\s*\r?\n\s*/g, ' ').trim()
      // parseFrontmatter strips one pair of surrounding quotes, so protect values that start with a quote.
      if (value.startsWith('"')) value = `'${value}'`
      else if (value.startsWith("'")) value = `"${value}"`
      return `${k}: ${value}`
    })
  return `---\n${lines.join('\n')}\n---\n${body.replace(/\r\n/g, '\n').trim()}\n`
}

export const IMAGE_RE = /\.(jpe?g|png|webp|avif)$/i

/** Downscales a photo to at most `max` px on the long edge and re-encodes it as JPEG (this also drops EXIF/GPS data). */
export async function resizeImage(file, max = 2000, quality = 0.85) {
  let bitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new Error(`Couldn't read ${file.name}. Use a JPG, PNG or WebP photo.`)
  }
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
  return { base64: bytesToBase64(new Uint8Array(await blob.arrayBuffer())), url: URL.createObjectURL(blob) }
}
