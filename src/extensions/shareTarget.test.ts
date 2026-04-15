import { describe, expect, it } from 'vitest'
import { readShareTargetPayload } from './shareTarget'

describe('readShareTargetPayload', () => {
  it('reads shared payload when the explicit source marker exists', () => {
    expect(
      readShareTargetPayload(
        '?source=share&share_title=Shared%20idea&share_text=Hello&share_url=https%3A%2F%2Fexample.com',
      ),
    ).toEqual({
      title: 'Shared idea',
      text: 'Hello',
      url: 'https://example.com',
    })
  })

  it('treats share params as a share launch even without the source marker', () => {
    expect(
      readShareTargetPayload(
        '?share_title=Shared%20idea&share_text=Hello&share_url=https%3A%2F%2Fexample.com',
      ),
    ).toEqual({
      title: 'Shared idea',
      text: 'Hello',
      url: 'https://example.com',
    })
  })

  it('returns null when no share parameters are present', () => {
    expect(readShareTargetPayload('?foo=bar')).toBeNull()
  })
})
