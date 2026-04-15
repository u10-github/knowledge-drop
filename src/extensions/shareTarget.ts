export type ShareTargetPayload = {
  url: string
  title: string
  text: string
}

export function readShareTargetPayload(
  search: string | URLSearchParams,
): ShareTargetPayload | null {
  const params =
    typeof search === 'string'
      ? new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
      : search

  const hasShareSource = params.get('source') === 'share'
  const hasSharePayload =
    params.has('share_url') || params.has('share_title') || params.has('share_text')

  if (!hasShareSource && !hasSharePayload) {
    return null
  }

  return {
    url: params.get('share_url')?.trim() ?? '',
    title: params.get('share_title')?.trim() ?? '',
    text: params.get('share_text')?.trim() ?? '',
  }
}
