import { describe, expect, it } from 'vitest'
import {
  extractHttpUrl,
  firstMeaningfulLine,
  normalizeSingleLineText,
  truncateText,
} from './text'

describe('truncateText', () => {
  it('keeps text within the limit untouched', () => {
    expect(truncateText('short text', 20)).toBe('short text')
  })

  it('truncates text longer than the limit', () => {
    expect(truncateText('1234567890', 7)).toBe('1234...')
  })
})

describe('firstMeaningfulLine', () => {
  it('returns the first non-empty line across values', () => {
    expect(firstMeaningfulLine('\n', '\nhello\nworld')).toBe('hello')
  })
})

describe('normalizeSingleLineText', () => {
  it('collapses whitespace and keeps the first line', () => {
    expect(normalizeSingleLineText('  hello   world \nsecond line')).toBe('hello world')
  })
})

describe('extractHttpUrl', () => {
  it('returns a normalized http or https url', () => {
    expect(extractHttpUrl(' https://example.com/path ')).toBe('https://example.com/path')
    expect(extractHttpUrl('http://example.com')).toBe('http://example.com/')
  })

  it('returns an empty string for non-urls', () => {
    expect(extractHttpUrl('hello https://example.com')).toBe('')
    expect(extractHttpUrl('mailto:test@example.com')).toBe('')
  })
})
