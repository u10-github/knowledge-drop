import { MAX_TEXT_LENGTH } from './constants'

export function normalizeMultilineText(value: string): string {
  return value.replace(/\r\n/g, '\n').trim()
}

export function normalizeSingleLineText(value: string): string {
  return (
    normalizeMultilineText(value).split('\n').find(Boolean)?.trim().replace(/\s+/g, ' ') ?? ''
  )
}

export function truncateText(value: string, maxLength = MAX_TEXT_LENGTH): string {
  if (value.length <= maxLength) {
    return value
  }

  if (maxLength <= 3) {
    return value.slice(0, maxLength)
  }

  return `${value.slice(0, maxLength - 3)}...`
}

export function firstMeaningfulLine(...values: string[]): string {
  for (const value of values) {
    const line = normalizeMultilineText(value).split('\n').find(Boolean)
    if (line) {
      return line.trim()
    }
  }

  return ''
}

export function extractHostname(value: string): string {
  try {
    return new URL(value).hostname
  } catch {
    return ''
  }
}

export function extractHttpUrl(value: string): string {
  const candidate = normalizeSingleLineText(value)

  if (!candidate) {
    return ''
  }

  try {
    const parsedUrl = new URL(candidate)
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
      ? parsedUrl.toString()
      : ''
  } catch {
    return ''
  }
}
