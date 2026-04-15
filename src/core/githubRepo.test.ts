import { describe, expect, it } from 'vitest'
import { parseGitHubRepoUrl } from './githubRepo'

describe('parseGitHubRepoUrl', () => {
  it('parses a valid repository URL', () => {
    expect(parseGitHubRepoUrl('https://github.com/octo/example')).toEqual({
      kind: 'valid',
      repo: {
        owner: 'octo',
        repo: 'example',
        normalizedUrl: 'https://github.com/octo/example',
      },
    })
  })

  it('accepts a trailing slash and normalizes it', () => {
    expect(parseGitHubRepoUrl('https://github.com/octo/example/')).toEqual({
      kind: 'valid',
      repo: {
        owner: 'octo',
        repo: 'example',
        normalizedUrl: 'https://github.com/octo/example',
      },
    })
  })

  it('rejects non-github hosts', () => {
    expect(parseGitHubRepoUrl('https://gitlab.com/octo/example')).toMatchObject({
      kind: 'invalid',
    })
  })

  it('rejects extra path segments', () => {
    expect(parseGitHubRepoUrl('https://github.com/octo/example/issues')).toMatchObject({
      kind: 'invalid',
    })
  })
})
