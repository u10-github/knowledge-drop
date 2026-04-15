declare global {
  interface Window {
    __KNOWLEDGE_DROP_NAVIGATION_HOOK__?: (url: string) => void
  }
}

export function openInCurrentTab(
  url: string,
  locationObject: Pick<Location, 'assign'> = window.location,
): void {
  if (typeof window !== 'undefined' && window.__KNOWLEDGE_DROP_NAVIGATION_HOOK__) {
    window.__KNOWLEDGE_DROP_NAVIGATION_HOOK__(url)
    return
  }

  locationObject.assign(url)
}
