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

  if (params.get('source') !== 'share') {
    return null
  }

  return {
    url: params.get('share_url')?.trim() ?? '',
    title: params.get('share_title')?.trim() ?? '',
    text: params.get('share_text')?.trim() ?? '',
  }
}
