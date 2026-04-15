declare global {
  interface Window {
    __KNOWLEDGE_DROP_NAVIGATION_HOOK__?: (url: string) => void
  }
}

type NavigationLocation = Pick<Location, 'assign' | 'origin' | 'href'>
type NavigationWindow = Pick<Window, 'open'> & {
  __KNOWLEDGE_DROP_NAVIGATION_HOOK__?: (url: string) => void
}

export function openInCurrentTab(
  url: string,
  locationObject: NavigationLocation = window.location,
  windowObject: NavigationWindow = window,
): void {
  if (windowObject.__KNOWLEDGE_DROP_NAVIGATION_HOOK__) {
    windowObject.__KNOWLEDGE_DROP_NAVIGATION_HOOK__(url)
    return
  }

  if (shouldPreferNewWindow(url, locationObject)) {
    const openedWindow = windowObject.open(url, '_blank', 'noopener,noreferrer')
    if (openedWindow) {
      return
    }
  }

  locationObject.assign(url)
}

function shouldPreferNewWindow(url: string, locationObject: NavigationLocation): boolean {
  try {
    const destination = new URL(url, locationObject.href)
    return destination.origin !== locationObject.origin
  } catch {
    return false
  }
}
