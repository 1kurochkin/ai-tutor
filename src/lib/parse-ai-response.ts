import {Annotation} from "@/components/pdf/pdf-view";


export interface ParsedAIResponse {
  cleanText: string
  annotations: Annotation[]
  navigation?: number
}

export function parseAIResponse(response: string): ParsedAIResponse {
  const annotations: Annotation[] = []
  let navigation: number = 1
  let cleanText = response

  // Parse navigation commands [NAVIGATE:page_number]
  const navigateRegex = /\[NAVIGATE:(\d+)\]/g
  let match
  while ((match = navigateRegex.exec(response)) !== null) {
    navigation = parseInt(match[1], 10)
    cleanText = cleanText.replace(match[0], '')
  }

  // Parse highlight commands [HIGHLIGHT:page_number:exact_text]
  const highlightRegex = /\[HIGHLIGHT:(\d+):([^\]]+)\]/g
  while ((match = highlightRegex.exec(response)) !== null) {
    const currentPage = parseInt(match[1], 10)
    const textReference = match[2].trim()

    annotations.push({
      id: `highlight-${Date.now()}-${Math.random()}`,
      type: 'highlight',
      currentPage,
      textReference,
      color: 'yellow',
      coordinates: { x: 0, y: 0, width: 100, height: 20 }, // Placeholder - will be calculated
    })
    cleanText = cleanText.replace(match[0], '')
  }

  // Parse circle commands [CIRCLE:page_number:exact_text]
  const circleRegex = /\[CIRCLE:(\d+):([^\]]+)\]/g
  while ((match = circleRegex.exec(response)) !== null) {
    const currentPage = parseInt(match[1], 10)
    const textReference = match[2].trim()

    annotations.push({
      id: `circle-${Date.now()}-${Math.random()}`,
      type: 'circle',
      currentPage,
      textReference,
      color: '#ff6b6b', // Default red for circles
      coordinates: { x: 0, y: 0, width: 100, height: 100 }, // Placeholder - will be calculated
    })
    cleanText = cleanText.replace(match[0], '')
  }

  // Clean up any remaining whitespace and normalize
  cleanText = cleanText.replace(/\s+/g, ' ').trim()

  return {
    cleanText,
    annotations,
    navigation,
  }
}
