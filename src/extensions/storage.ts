export const REPOSITORY_URL_STORAGE_KEY = 'knowledge-drop.repository-url'

function getStorage(storage?: Storage): Storage | undefined {
  if (storage) {
    return storage
  }

  if (typeof window === 'undefined') {
    return undefined
  }

  return window.localStorage
}

export function loadStoredRepositoryUrl(storage?: Storage): string | null {
  return getStorage(storage)?.getItem(REPOSITORY_URL_STORAGE_KEY) ?? null
}

export function saveStoredRepositoryUrl(value: string, storage?: Storage): void {
  getStorage(storage)?.setItem(REPOSITORY_URL_STORAGE_KEY, value)
}

export function clearStoredRepositoryUrl(storage?: Storage): void {
  getStorage(storage)?.removeItem(REPOSITORY_URL_STORAGE_KEY)
}
