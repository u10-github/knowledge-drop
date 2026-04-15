import { describe, expect, it } from 'vitest'
import { buildIssueCreateUrl } from './issueUrl'

describe('buildIssueCreateUrl', () => {
  it('builds a GitHub issue creation URL with template and fields', () => {
    const url = new URL(
      buildIssueCreateUrl(
        {
          owner: 'octo',
          repo: 'knowledge-drop',
          normalizedUrl: 'https://github.com/octo/knowledge-drop',
        },
        {
          template: 'inbox-manual.yml',
          title: 'inbox: A note',
          fields: {
            url: 'https://example.com',
            manual_title: 'A note',
          },
        },
      ),
    )

    expect(url.origin + url.pathname).toBe('https://github.com/octo/knowledge-drop/issues/new')
    expect(url.searchParams.get('template')).toBe('inbox-manual.yml')
    expect(url.searchParams.get('title')).toBe('inbox: A note')
    expect(url.searchParams.get('url')).toBe('https://example.com')
    expect(url.searchParams.get('manual_title')).toBe('A note')
  })
})
