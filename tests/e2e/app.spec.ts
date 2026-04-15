import { expect, test } from '@playwright/test'
import { REPOSITORY_URL_STORAGE_KEY } from '../../src/extensions/storage'

test('shared launch redirects to the GitHub issue form', async ({ page }) => {
  await page.addInitScript((storageKeys: string[]) => {
    const storageKey = storageKeys[0]
    window.__KNOWLEDGE_DROP_CAPTURED_URLS__ = []
    window.__KNOWLEDGE_DROP_NAVIGATION_HOOK__ = (url) => {
      window.__KNOWLEDGE_DROP_CAPTURED_URLS__?.push(url)
    }

    if (!storageKey) {
      return
    }

    window.localStorage.setItem(storageKey, 'https://github.com/octo/knowledge-drop')
  }, [REPOSITORY_URL_STORAGE_KEY])

  await page.goto(
    '/?source=share&share_title=Shared%20idea&share_text=Hello&share_url=https%3A%2F%2Fexample.com',
  )
  await page.waitForFunction(
    () => (window.__KNOWLEDGE_DROP_CAPTURED_URLS__?.length ?? 0) >= 1,
  )

  const redirectedUrl = await page.evaluate(
    () => window.__KNOWLEDGE_DROP_CAPTURED_URLS__?.[0] ?? '',
  )
  const url = new URL(redirectedUrl)
  expect(url.searchParams.get('template')).toBe('inbox-share.yml')
  expect(url.searchParams.get('title')).toBe('inbox: Shared idea')
  expect(url.searchParams.get('shared_title')).toBe('Shared idea')
  expect(url.searchParams.get('shared_text')).toBe('Hello')
  expect(url.searchParams.get('url')).toBe('https://example.com')
})

test('manual form opens the GitHub issue form', async ({ page }) => {
  await page.addInitScript(() => {
    window.__KNOWLEDGE_DROP_CAPTURED_URLS__ = []
    window.__KNOWLEDGE_DROP_NAVIGATION_HOOK__ = (url) => {
      window.__KNOWLEDGE_DROP_CAPTURED_URLS__?.push(url)
    }
  })

  await page.goto('/')
  await page.getByLabel('GitHub リポジトリ URL').fill('https://github.com/octo/knowledge-drop')
  await page.getByRole('button', { name: '保存する' }).click()

  await page.locator('input[name="url"]').fill('https://example.com/manual')
  await page.locator('input[name="title"]').fill('Manual note')
  await page.locator('textarea[name="text"]').fill('Captured text')
  await page.locator('textarea[name="memo"]').fill('Follow up later')
  await page.getByRole('button', { name: 'Issueを開く' }).click()
  await page.waitForFunction(
    () => (window.__KNOWLEDGE_DROP_CAPTURED_URLS__?.length ?? 0) >= 1,
  )

  const redirectedUrl = await page.evaluate(
    () => window.__KNOWLEDGE_DROP_CAPTURED_URLS__?.[0] ?? '',
  )
  const url = new URL(redirectedUrl)
  expect(url.searchParams.get('template')).toBe('inbox-manual.yml')
  expect(url.searchParams.get('title')).toBe('inbox: Manual note')
  expect(url.searchParams.get('manual_title')).toBe('Manual note')
  expect(url.searchParams.get('manual_text')).toBe('Captured text')
  expect(url.searchParams.get('memo')).toBe('Follow up later')
  expect(url.searchParams.get('url')).toBe('https://example.com/manual')
})
