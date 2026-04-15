import { describe, expect, it } from 'vitest'
import { buildManualIssueDraft, buildShareIssueDraft } from './issueDraft'

describe('buildShareIssueDraft', () => {
  it('uses the shared title when it exists', () => {
    expect(
      buildShareIssueDraft({
        url: 'https://example.com/post',
        title: 'A shared article',
        text: 'hello',
      }),
    ).toMatchObject({
      template: 'inbox-share.yml',
      title: 'inbox: A shared article',
      fields: {
        url: 'https://example.com/post',
        shared_title: 'A shared article',
        shared_text: 'hello',
      },
    })
  })

  it('falls back to the URL domain when the shared title is missing', () => {
    expect(
      buildShareIssueDraft({
        url: 'https://example.com/post',
        title: '',
        text: '',
      }).title,
    ).toBe('inbox: example.com')
  })
})

describe('buildManualIssueDraft', () => {
  it('prefers manual title for the issue title', () => {
    expect(
      buildManualIssueDraft({
        url: '',
        title: 'My note',
        text: '',
        memo: '',
      }).title,
    ).toBe('inbox: My note')
  })

  it('falls back to the URL and then the first line of text', () => {
    expect(
      buildManualIssueDraft({
        url: 'https://example.com/post',
        title: '',
        text: '',
        memo: '',
      }).title,
    ).toBe('inbox: https://example.com/post')

    expect(
      buildManualIssueDraft({
        url: '',
        title: '',
        text: '\nImportant takeaway\nMore details',
        memo: '',
      }).title,
    ).toBe('inbox: Important takeaway')
  })

  it('omits empty fields from the generated query fields', () => {
    expect(
      buildManualIssueDraft({
        url: '',
        title: 'My note',
        text: '',
        memo: '',
      }).fields,
    ).toEqual({
      manual_title: 'My note',
    })
  })
})
