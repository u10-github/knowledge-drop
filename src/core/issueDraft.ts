import { MANUAL_TEMPLATE_FILE, SHARE_TEMPLATE_FILE } from './constants'
import {
  extractHttpUrl,
  extractHostname,
  firstMeaningfulLine,
  normalizeMultilineText,
  normalizeSingleLineText,
  truncateText,
} from './text'

export type ManualIssueInput = {
  url: string
  title: string
  text: string
  memo: string
}

export type ShareIssueInput = {
  url: string
  title: string
  text: string
}

export type IssueDraft = {
  template: string
  title: string
  fields: Record<string, string>
}

export function buildShareIssueDraft(input: ShareIssueInput): IssueDraft {
  const normalizedText = truncateText(normalizeMultilineText(input.text))
  const normalized = normalizeShareInput({
    url: normalizeMultilineText(input.url),
    title: normalizeSingleLineText(input.title),
    text: normalizedText,
  })

  const titleSeed =
    normalized.title ||
    extractHostname(normalized.url) ||
    firstMeaningfulLine(normalized.text) ||
    'shared item'

  return {
    template: SHARE_TEMPLATE_FILE,
    title: `inbox: ${titleSeed}`,
    fields: compactFields({
      url: normalized.url,
      shared_title: normalized.title,
      shared_text: normalized.text,
    }),
  }
}

function normalizeShareInput(input: ShareIssueInput): ShareIssueInput {
  if (input.url) {
    return input
  }

  const lines = input.text.split('\n')
  const firstLineUrl = extractHttpUrl(lines[0] ?? '')
  if (!firstLineUrl) {
    return input
  }

  return {
    ...input,
    url: firstLineUrl,
    text: lines.slice(1).join('\n').trim(),
  }
}

export function buildManualIssueDraft(input: ManualIssueInput): IssueDraft {
  const normalized = {
    url: normalizeMultilineText(input.url),
    title: normalizeSingleLineText(input.title),
    text: truncateText(normalizeMultilineText(input.text)),
    memo: normalizeMultilineText(input.memo),
  }

  const titleSeed =
    normalized.title ||
    normalized.url ||
    firstMeaningfulLine(normalized.text, normalized.memo) ||
    'untitled'

  return {
    template: MANUAL_TEMPLATE_FILE,
    title: `inbox: ${titleSeed}`,
    fields: compactFields({
      url: normalized.url,
      manual_title: normalized.title,
      manual_text: normalized.text,
      memo: normalized.memo,
    }),
  }
}

function compactFields(fields: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value.length > 0),
  )
}
