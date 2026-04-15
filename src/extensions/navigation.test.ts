import { describe, expect, it, vi } from 'vitest'
import { openInCurrentTab } from './navigation'

describe('openInCurrentTab', () => {
  it('uses assign for same-origin navigation', () => {
    const assign = vi.fn()
    const open = vi.fn()

    openInCurrentTab(
      '/knowledge-drop/?source=share',
      {
        assign,
        origin: 'https://u10-github.github.io',
        href: 'https://u10-github.github.io/knowledge-drop/',
      },
      { open },
    )

    expect(open).not.toHaveBeenCalled()
    expect(assign).toHaveBeenCalledWith('/knowledge-drop/?source=share')
  })

  it('prefers a new window for cross-origin navigation', () => {
    const assign = vi.fn()
    const open = vi.fn(() => ({}) as Window)

    openInCurrentTab(
      'https://github.com/octo/knowledge-drop/issues/new',
      {
        assign,
        origin: 'https://u10-github.github.io',
        href: 'https://u10-github.github.io/knowledge-drop/?source=share',
      },
      { open },
    )

    expect(open).toHaveBeenCalledWith(
      'https://github.com/octo/knowledge-drop/issues/new',
      '_blank',
      'noopener,noreferrer',
    )
    expect(assign).not.toHaveBeenCalled()
  })

  it('falls back to assign when opening a new window is blocked', () => {
    const assign = vi.fn()
    const open = vi.fn(() => null)

    openInCurrentTab(
      'https://github.com/octo/knowledge-drop/issues/new',
      {
        assign,
        origin: 'https://u10-github.github.io',
        href: 'https://u10-github.github.io/knowledge-drop/?source=share',
      },
      { open },
    )

    expect(open).toHaveBeenCalled()
    expect(assign).toHaveBeenCalledWith(
      'https://github.com/octo/knowledge-drop/issues/new',
    )
  })
})
