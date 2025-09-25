import { PDFPageProxy } from 'pdfjs-dist'

// Normalize curly quotes, dashes, and case for reliable matching
function normalizeText(str: string): string {
  return str
      // Convert curly quotes to straight quotes
      .replace(/[’‘‛]/g, "'")
      .replace(/[“”„‟]/g, '"')
      // Convert en-dash, em-dash, and minus signs to simple hyphen
      .replace(/[–—−]/g, '-')
      // Remove zero-width spaces and non-breaking spaces
      .replace(/[\u200B\u00A0]/g, '')
      // Remove extra spaces, including spaces around hyphens
      .replace(/\s*-\s*/g, '-')     // normalize hyphen spacing
      .replace(/\s+/g, ' ')         // collapse multiple spaces
      .replace(/\u00A0/g, ' ')  // non-breaking space → normal space
      .replace(/[\u2010-\u2015]/g, '-') // all dash types → hyphen
      .trim()
      .toLowerCase()
}

export async function findTextCoordinates(
    page: PDFPageProxy,
    searchText: string,
    scale = 1,
): Promise<{ x: number; y: number; width: number; height: number }> {
  const textContent = await page.getTextContent()
  const items = textContent.items as any[]

  // Get viewport for coordinate conversion
  const scaledViewport = page.getViewport({ scale })

  // Normalize target text and take only first 3 words
  const normalizedSearch = normalizeText(searchText)
  const searchWords = normalizedSearch.split(' ').filter(word => word.length > 0)
  const target = searchWords.slice(0, 3).join(' ') // Use only first 3 words

  if (!target) {
    throw new Error('Search text is empty after normalization')
  }

  console.log('Searching for first 3 words:', target)

  // Convert items to words with coords
  const words = items.map((item: any) => {
    const [,,, e, f] = item.transform
    return {
      str: item.str,
      pdfX: e,
      pdfY: f,
      width: item.width || 0,
      height: item.height || 10,
    }
  })

  // Group into chunks and search
  const chunkSize = 15 // Slightly larger chunks to catch more context
  for (let i = 0; i < words.length; i += 1) { // Step by 1 to avoid missing matches
    const chunk = words.slice(i, i + chunkSize)

    // Skip if chunk is too small to contain our target
    if (chunk.length < searchWords.length) continue

    const chunkText = chunk.map(w => w.str).join(' ')
    const normalizedChunkText = normalizeText(chunkText)

    console.log(`Chunk ${i}: "${normalizedChunkText}"`)
    console.log(`Target: "${target}"`)
    console.log(`Match: ${normalizedChunkText.includes(target)}`)

    if (normalizedChunkText.includes(target)) {
      console.log("FOUND! Using chunk:", chunk)

      // Calculate bounding box in PDF coordinates - use exact item positions
      const pdfX = Math.min(...chunk.map(w => w.pdfX)) // Leftmost X
      const pdfY = Math.min(...chunk.map(w => w.pdfY)) // Lowest Y (PDF coordinates)
      const pdfWidth = Math.max(...chunk.map(w => w.pdfX + w.width)) - pdfX
      const pdfHeight = Math.max(...chunk.map(w => w.pdfY + w.height)) - pdfY + (20 / scale)   // Add buffer

      // Convert to web coordinates (top-left origin)
      const webX = pdfX * scale
      const webY = scaledViewport.height - (pdfY + pdfHeight) * scale
      const webWidth = pdfWidth * scale
      const webHeight = pdfHeight * scale

      console.log('PDF Coordinates:', { pdfX, pdfY, pdfWidth, pdfHeight })
      console.log('Web Coordinates:', { webX, webY, webWidth, webHeight })

      return { x: webX, y: webY, width: webWidth, height: webHeight }
    }
  }

  throw new Error(`Text "${searchText}" not found (searched for: "${target}")`)
}
