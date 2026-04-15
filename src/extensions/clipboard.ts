export type CopyResult =
  | { kind: 'success' }
  | { kind: 'unsupported'; message: string }
  | { kind: 'error'; message: string }

export async function copyTextToClipboard(
  value: string,
  clipboardApi?: Pick<Clipboard, 'writeText'>,
): Promise<CopyResult> {
  const targetClipboard =
    clipboardApi ?? (typeof navigator === 'undefined' ? undefined : navigator.clipboard)

  if (!targetClipboard) {
    return {
      kind: 'unsupported',
      message: 'この環境ではクリップボード API を利用できません。',
    }
  }

  try {
    await targetClipboard.writeText(value)
    return { kind: 'success' }
  } catch {
    return {
      kind: 'error',
      message: 'コピーに失敗しました。ブラウザ権限を確認してください。',
    }
  }
}
