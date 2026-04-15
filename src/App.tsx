import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from 'react'
import './App.css'
import setupConfigTemplate from '../docs/ref/config.yml?raw'
import setupInstructions from '../docs/ref/setup-instructions.md?raw'
import manualTemplate from '../docs/ref/inbox-manual.yml?raw'
import shareTemplate from '../docs/ref/inbox-share.yml?raw'
import {
  buildManualIssueDraft,
  buildShareIssueDraft,
  type ManualIssueInput,
} from './core/issueDraft'
import { parseGitHubRepoUrl, type GitHubRepoConfig } from './core/githubRepo'
import { buildIssueCreateUrl } from './core/issueUrl'
import { copyTextToClipboard } from './extensions/clipboard'
import { openInCurrentTab } from './extensions/navigation'
import { readShareTargetPayload } from './extensions/shareTarget'
import {
  clearStoredRepositoryUrl,
  loadStoredRepositoryUrl,
  saveStoredRepositoryUrl,
} from './extensions/storage'

type Notice = {
  kind: 'success' | 'error'
  text: string
}

const INITIAL_MANUAL_INPUT: ManualIssueInput = {
  url: '',
  title: '',
  text: '',
  memo: '',
}

function getInitialRepositoryState(): {
  savedRepo: GitHubRepoConfig | null
  savedRepoUrl: string
} {
  const savedRepoUrl = loadStoredRepositoryUrl() ?? ''
  const parsed = savedRepoUrl ? parseGitHubRepoUrl(savedRepoUrl) : null

  return {
    savedRepo: parsed?.kind === 'valid' ? parsed.repo : null,
    savedRepoUrl,
  }
}

function App() {
  const initialRepositoryState = useMemo(() => getInitialRepositoryState(), [])
  const [savedRepo, setSavedRepo] = useState<GitHubRepoConfig | null>(
    initialRepositoryState.savedRepo,
  )
  const [repositoryInput, setRepositoryInput] = useState(initialRepositoryState.savedRepoUrl)
  const [manualInput, setManualInput] = useState<ManualIssueInput>(INITIAL_MANUAL_INPUT)
  const [notice, setNotice] = useState<Notice | null>(null)

  const sharePayload = useMemo(
    () => readShareTargetPayload(window.location.search),
    [],
  )
  const shareTargetUrl = useMemo(() => {
    if (!sharePayload || !savedRepo) {
      return null
    }

    return buildIssueCreateUrl(savedRepo, buildShareIssueDraft(sharePayload))
  }, [savedRepo, sharePayload])
  const repositoryPreview = repositoryInput ? parseGitHubRepoUrl(repositoryInput) : null

  useEffect(() => {
    if (!shareTargetUrl) {
      return
    }

    openInCurrentTab(shareTargetUrl)
  }, [shareTargetUrl])

  async function handleCopy(label: string, content: string): Promise<void> {
    const result = await copyTextToClipboard(content)

    if (result.kind === 'success') {
      setNotice({ kind: 'success', text: `${label} をコピーしました。` })
      return
    }

    setNotice({ kind: 'error', text: result.message })
  }

  function handleRepositorySubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()

    const parsed = parseGitHubRepoUrl(repositoryInput)
    if (parsed.kind === 'invalid') {
      setNotice({ kind: 'error', text: parsed.message })
      return
    }

    saveStoredRepositoryUrl(parsed.repo.normalizedUrl)
    setSavedRepo(parsed.repo)
    setRepositoryInput(parsed.repo.normalizedUrl)
    setNotice({
      kind: 'success',
      text: `保存先を ${parsed.repo.owner}/${parsed.repo.repo} に設定しました。`,
    })
  }

  function handleRepositoryClear(): void {
    clearStoredRepositoryUrl()
    setSavedRepo(null)
    setRepositoryInput('')
    setNotice({ kind: 'success', text: '保存先の設定を削除しました。' })
  }

  function handleManualInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void {
    const { name, value } = event.target
    setManualInput((current) => ({ ...current, [name]: value }))
  }

  function handleManualSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()

    if (!savedRepo) {
      setNotice({
        kind: 'error',
        text: '先に保存先 GitHub リポジトリ URL を設定してください。',
      })
      return
    }

    const issueUrl = buildIssueCreateUrl(savedRepo, buildManualIssueDraft(manualInput))
    openInCurrentTab(issueUrl)
  }

  const shareModeBlocked = Boolean(sharePayload && !savedRepo)

  if (sharePayload && savedRepo) {
    return (
      <main className="app-shell share-shell">
        <section className="card hero-card">
          <p className="eyebrow">共有起動</p>
          <h1>GitHub Issue 作成画面を開いています</h1>
          <p className="hero-text">
            共有内容を <strong>{savedRepo.owner}/{savedRepo.repo}</strong> 向けの
            Issue Form に流し込みます。
          </p>
          <p className="hero-subtext">
            自動送信は行わず、GitHub 画面で最終確認してから作成してください。
          </p>
          {shareTargetUrl ? (
            <a
              className="button secondary-button"
              href={shareTargetUrl}
              target="_blank"
              rel="noreferrer"
            >
              開かない場合はこちら
            </a>
          ) : null}
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <section className="card hero-card">
        <p className="eyebrow">Knowledge Drop</p>
        <h1>GitHub Issue へ素早く退避する PWA</h1>
        <p className="hero-text">
          URL やメモを GitHub API なしで Issue Form に流し込み、あとから AI や手作業で
          知見化しやすい状態を作ります。
        </p>
        <p className="hero-subtext">
          保存先は 1 リポジトリだけ保持し、共有起動では中間フォームなしで GitHub の
          Issue 作成画面へ遷移します。
        </p>
      </section>

      {notice ? (
        <section className={`notice notice-${notice.kind}`} aria-live="polite">
          {notice.text}
        </section>
      ) : null}

      {shareModeBlocked ? (
        <section className="card warning-card">
          <h2>共有起動を処理するには、先に保存先リポジトリの設定が必要です</h2>
          <p>
            一度だけ GitHub リポジトリ URL を保存すると、以後は共有から直接 Issue
            作成画面を開けます。
          </p>
        </section>
      ) : null}

      <div className="layout-grid">
        <section className="card">
          <header className="section-header">
            <div>
              <p className="eyebrow">Step 1</p>
              <h2>保存先 GitHub リポジトリ</h2>
            </div>
            {savedRepo ? (
              <span className="pill">
                {savedRepo.owner}/{savedRepo.repo}
              </span>
            ) : (
              <span className="pill pill-muted">未設定</span>
            )}
          </header>

          <form className="stack" onSubmit={handleRepositorySubmit}>
            <label className="field">
              <span className="label">GitHub リポジトリ URL</span>
              <input
                name="repository"
                type="url"
                value={repositoryInput}
                onChange={(event) => setRepositoryInput(event.target.value)}
                placeholder="https://github.com/owner/repo"
                autoComplete="off"
              />
            </label>

            {repositoryPreview ? (
              <p
                className={
                  repositoryPreview.kind === 'valid' ? 'helper ok-text' : 'helper error-text'
                }
              >
                {repositoryPreview.kind === 'valid'
                  ? `保存時は ${repositoryPreview.repo.normalizedUrl} に正規化します。`
                  : repositoryPreview.message}
              </p>
            ) : (
              <p className="helper">
                https://github.com/owner/repo 形式だけを受け付けます。
              </p>
            )}

            <div className="actions">
              <button className="button primary-button" type="submit">
                保存する
              </button>
              <button
                className="button secondary-button"
                type="button"
                onClick={handleRepositoryClear}
              >
                設定を消す
              </button>
            </div>
          </form>
        </section>

        <section className="card">
          <header className="section-header">
            <div>
              <p className="eyebrow">Step 2</p>
              <h2>通常起動で Issue を開く</h2>
            </div>
          </header>

          <form className="stack" onSubmit={handleManualSubmit}>
            <label className="field">
              <span className="label">URL</span>
              <input
                name="url"
                type="url"
                value={manualInput.url}
                onChange={handleManualInputChange}
                placeholder="https://example.com/article"
              />
            </label>

            <label className="field">
              <span className="label">Title</span>
              <input
                name="title"
                type="text"
                value={manualInput.title}
                onChange={handleManualInputChange}
                placeholder="あとで見返したいタイトル"
              />
            </label>

            <label className="field">
              <span className="label">Text</span>
              <textarea
                name="text"
                rows={6}
                value={manualInput.text}
                onChange={handleManualInputChange}
                placeholder="本文や抜粋を貼り付ける"
              />
              <span className="helper">Text は 2000 文字を超えると自動で切り詰めます。</span>
            </label>

            <label className="field">
              <span className="label">Memo</span>
              <textarea
                name="memo"
                rows={5}
                value={manualInput.memo}
                onChange={handleManualInputChange}
                placeholder={'- 何が良かったか\n- いつ使いたいか'}
              />
            </label>

            <div className="actions">
              <button className="button primary-button" type="submit">
                Issueを開く
              </button>
            </div>
          </form>
        </section>
      </div>

      <section className="card notice-card">
        <h2>安全上の注意</h2>
        <p>
          このアプリは GitHub API トークンや OAuth 情報を保持しません。機微情報や秘密情報を
          テキスト欄へ貼り付けないでください。
        </p>
      </section>

      <section className="card">
        <header className="section-header">
          <div>
            <p className="eyebrow">Step 3</p>
            <h2>GitHub 設定補助</h2>
          </div>
        </header>
        <p className="helper">
          対象リポジトリへ Issue Form を設置すると、共有起動と通常起動でテンプレートを切り替えられます。
        </p>

        <div className="copy-grid">
          <CopyPanel
            title="inbox-share.yml"
            content={shareTemplate}
            onCopy={() => handleCopy('inbox-share.yml', shareTemplate)}
          />
          <CopyPanel
            title="inbox-manual.yml"
            content={manualTemplate}
            onCopy={() => handleCopy('inbox-manual.yml', manualTemplate)}
          />
          <CopyPanel
            title="config.yml"
            content={setupConfigTemplate}
            onCopy={() => handleCopy('config.yml', setupConfigTemplate)}
          />
          <CopyPanel
            title="設置手順"
            content={setupInstructions}
            onCopy={() => handleCopy('設置手順', setupInstructions)}
          />
        </div>
      </section>

      <section className="card">
        <header className="section-header">
          <div>
            <p className="eyebrow">使い方</p>
            <h2>最小の運用フロー</h2>
          </div>
        </header>
        <ol className="how-to-list">
          <li>初回だけ保存先 GitHub リポジトリ URL を設定する</li>
          <li>GitHub 設定補助から Issue Form を対象リポジトリへ設置する</li>
          <li>Android 共有または通常起動フォームから Issue 作成画面を開く</li>
          <li>GitHub 側で最終確認して Issue を作成する</li>
          <li>あとから AI や手作業で `raw/` / `cards/` / `index/` へ知見化する</li>
        </ol>
      </section>
    </main>
  )
}

type CopyPanelProps = {
  title: string
  content: string
  onCopy: () => void
}

function CopyPanel({ title, content, onCopy }: CopyPanelProps) {
  return (
    <article className="copy-panel">
      <div className="copy-panel-header">
        <h3>{title}</h3>
        <button className="button secondary-button" type="button" onClick={onCopy}>
          コピー
        </button>
      </div>
      <pre>{content}</pre>
    </article>
  )
}

export default App
