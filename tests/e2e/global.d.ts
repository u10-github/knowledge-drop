declare global {
  interface Window {
    __KNOWLEDGE_DROP_CAPTURED_URLS__?: string[]
    __KNOWLEDGE_DROP_NAVIGATION_HOOK__?: (url: string) => void
  }
}

export {}
