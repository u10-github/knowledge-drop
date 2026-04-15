import { describe, expect, it } from 'vitest'
import { firstMeaningfulLine, normalizeSingleLineText, truncateText } from './text'

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
