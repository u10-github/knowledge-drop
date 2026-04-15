import type { GitHubRepoConfig } from './githubRepo'
import type { IssueDraft } from './issueDraft'

export function buildIssueCreateUrl(repo: GitHubRepoConfig, draft: IssueDraft): string {
  const issueUrl = new URL(`https://github.com/${repo.owner}/${repo.repo}/issues/new`)
  issueUrl.searchParams.set('template', draft.template)
  issueUrl.searchParams.set('title', draft.title)

  for (const [key, value] of Object.entries(draft.fields)) {
    issueUrl.searchParams.set(key, value)
  }

  return issueUrl.toString()
}
