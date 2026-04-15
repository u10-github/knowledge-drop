export type GitHubRepoConfig = {
  owner: string
  repo: string
  normalizedUrl: string
}

export type ParseGitHubRepoUrlResult =
  | {
      kind: 'valid'
      repo: GitHubRepoConfig
    }
  | {
      kind: 'invalid'
      message: string
    }

export function parseGitHubRepoUrl(input: string): ParseGitHubRepoUrlResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return {
      kind: 'invalid',
      message: 'GitHub リポジトリ URL を入力してください。',
    }
  }

  let parsedUrl: URL

  try {
    parsedUrl = new URL(trimmed)
  } catch {
    return {
      kind: 'invalid',
      message: 'GitHub リポジトリ URL の形式が不正です。',
    }
  }

  if (parsedUrl.protocol !== 'https:' || parsedUrl.hostname !== 'github.com') {
    return {
      kind: 'invalid',
      message: 'https://github.com/{owner}/{repo} 形式のみ受け付けます。',
    }
  }

  if (parsedUrl.search || parsedUrl.hash) {
    return {
      kind: 'invalid',
      message: 'クエリ文字列やハッシュを含まないリポジトリ URL を指定してください。',
    }
  }

  const segments = parsedUrl.pathname.split('/').filter(Boolean)
  if (segments.length !== 2) {
    return {
      kind: 'invalid',
      message: 'GitHub リポジトリ URL は owner/repo までを指定してください。',
    }
  }

  const owner = segments[0]
  const repo = segments[1]

  if (!owner || !repo) {
    return {
      kind: 'invalid',
      message: 'GitHub リポジトリ URL は owner/repo までを指定してください。',
    }
  }

  return {
    kind: 'valid',
    repo: {
      owner,
      repo,
      normalizedUrl: `https://github.com/${owner}/${repo}`,
    },
  }
}
