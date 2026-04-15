# Knowledge Drop

Android の共有メニューや通常起動から URL / メモを受け取り、GitHub Issue 作成画面へ流し込むための PWA です。
GitHub API は使わず、Issue Form の URL パラメータだけで下書きを作ります。

公開 URL:
`https://u10-github.github.io/knowledge-drop/`

## 開発

```bash
npm install
npm run dev
```

## 検証

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```

## GitHub Pages デプロイ

この repo は `.github/workflows/deploy-pages.yml` で `dist/` を GitHub Pages に公開します。

重要:
- Pages の配信元は `GitHub Actions` を使う
- `main /` の branch 配信にすると、未ビルドの `index.html` がそのまま公開されて白画面になる

現状確認コマンド:

```bash
gh api repos/u10-github/knowledge-drop/pages
```

期待する状態:
- `build_type: "workflow"`
- 公開 URL が `https://u10-github.github.io/knowledge-drop/`

デプロイを手動実行したいとき:

```bash
gh workflow run deploy-pages.yml --repo u10-github/knowledge-drop
```
