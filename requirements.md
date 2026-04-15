# requirement.md

## 1. 概要

本アプリは、Android の共有機能または通常起動から、URL やメモを **GitHub Issue として素早く保存するための PWA** である。

主目的は、情報を美しく整理することではない。  
**「あとで AI が再発見できる形で GitHub に退避し、人間は安心して忘れられる状態を作ること」** を目的とする。

本アプリ自体は、GitHub に直接書き込む API クライアントではなく、**GitHub の Issue 作成画面を開くための補助ツール** とする。

---

## 2. 背景

URL やメモを雑に保存したいが、都度整理するのは負担が大きい。  
一方で、あとからローカル AI（例: GitHub Copilot CLI など）に Issue を処理させ、`raw/` / `cards/` / `index/` へ知見化する運用は成立する。

そのため、まずは **低コスト・低リスクで投入だけを楽にする PWA** を作る。

---

## 3. 目的

### 3.1 主目的
- Android の共有から、素早く GitHub Issue 作成画面を開ける
- 通常起動時は、URLや知見メモを手入力して Issue 化できる
- 保存先は GitHub リポジトリ 1 件に絞り、設定を最小にする
- 後続の AI / 手動処理に渡しやすい Issue 形式を作る

### 3.2 副次目的
- GitHub 側の Issue Template 設定を簡単にする
- 他人が使っても最低限迷わない使い方を用意する
- テスト・lint を整備し、AI 実装でも壊れにくい構成にする

---

## 4. 非目標

以下は本アプリの初期スコープ外とする。

- GitHub API を使った直接的な Issue 作成
- GitHub API を使った `inbox/` フォルダへの直接書き込み
- サーバーサイドの導入
- GitHub OAuth / PAT / GitHub App を用いた認証
- Issue の自動送信
- 知見化処理そのものの自動実行
- ベクトルDBや埋め込み検索の導入
- 高度なデザインやリッチな UI 演出

---

## 5. 想定ユーザー

### 5.1 主ユーザー
- 開発者本人
- 自分用に URL / メモ / 知見を GitHub Issue へ退避したい人

### 5.2 副ユーザー
- 同様の用途で、自分の GitHub リポジトリへ保存したい他ユーザー

---

## 6. 提供価値

- 共有から最短で GitHub Issue 作成画面へ到達できる
- サーバー不要で運用できる
- GitHub の書き込みトークンをクライアントに持たずに済む
- 後続の AI 処理と相性の良い入力形式を強制できる
- 雑な保存と、後からの知見化を分離できる

---

## 7. システム構成

### 7.1 全体構成
- フロントエンド: GitHub Pages 上の静的 PWA
- 保存先: ユーザーが指定した GitHub リポジトリの Issue
- 後続処理: ローカル AI（例: GitHub Copilot CLI）または手動処理

### 7.2 デプロイ先
- GitHub Pages

### 7.3 前提
- ユーザーは GitHub にログイン済みであること
- 保存先リポジトリで Issue が有効であること
- Android 共有受信を使う場合は、PWA がインストール済みであること

---

## 8. アーキテクチャ方針

### 8.1 採用方針
本アプリは **Core & Extensions** を採用する。

### 8.2 Core
Core はフレームワーク非依存・副作用なしとし、以下を担当する。

- GitHub リポジトリ URL の解析
- 入力値バリデーション
- Issue title 生成
- Issue body 生成
- GitHub issue 作成 URL の組み立て
- 共有起動時 / 通常起動時の入力整形

### 8.3 Extensions
Extensions は副作用を持つ処理を担当する。

- PWA の share target 受信
- localStorage への設定保存
- ブラウザ遷移
- クリップボードコピー
- UI 層との接続

### 8.4 依存方向
- `Extensions -> Core`
- `UI -> Core`
- Core は Extensions / UI に依存してはならない

---

## 9. 技術スタック

- React
- TypeScript
- Vite
- vite-plugin-pwa
- Vitest
- Playwright
- ESLint

### 9.1 方針
- UI は最低限でよい
- AI に作らせやすい、標準的で壊れにくい構成を優先する
- TypeScript は `strict` を有効にする

---

## 10. 開発方針

### 10.1 TDD
本アプリは **t-wada TDD** を前提に実装する。

- Red -> Green -> Refactor
- 最小の失敗するテストを先に書く
- UI より先に Core の振る舞いを固定する
- 小さい変更単位で進める

### 10.2 品質ゲート
- lint が通ること
- unit test が通ること
- build が通ること
- 必要最小限の E2E が通ること

---

## 11. 機能要件

## 11.1 設定機能

### REQ-001
アプリは、保存先として **GitHub リポジトリ URL 1件** を設定できること。

### REQ-002
設定画面では、以下の形式のみ受け付けること。

- `https://github.com/{owner}/{repo}`
- 末尾スラッシュ付きも許容可

### REQ-003
設定値は localStorage に保存すること。

### REQ-004
設定済みリポジトリ URL から、内部的に `owner` と `repo` を抽出できること。

---

## 11.2 共有起動機能

### REQ-010
共有から起動されたとき、アプリは受け取った共有情報を元に **即座に GitHub Issue 作成画面へ遷移**すること。

### REQ-011
共有起動時は、中間フォーム画面を表示しないこと。

### REQ-012
共有起動時は、以下の情報を受け取れること。

- URL
- Title
- Text

### REQ-013
共有起動時は、GitHub Issue Template `inbox-share.yml` を使うこと。

### REQ-014
共有起動時は、Issue 作成画面へ渡す title と各入力値を自動生成すること。

### REQ-015
共有起動時は、自動で Issue を送信してはならないこと。  
最終的な Issue 作成は GitHub 画面上でユーザーが行うこと。

---

## 11.3 通常起動機能

### REQ-020
通常起動時は、以下を入力できるフォームを表示すること。

- URL
- Title
- Text
- Memo

### REQ-021
通常起動時は、`Issueを開く` ボタンを押すことで GitHub Issue 作成画面へ遷移すること。

### REQ-022
通常起動時は、GitHub Issue Template `inbox-manual.yml` を使うこと。

### REQ-023
URL がなくても Issue を作成できること。

### REQ-024
Text や Memo が空でも Issue を作成できること。

---

## 11.4 Issue 生成機能

### REQ-030
Issue タイトルは以下のルールで生成すること。

#### 共有起動時
- `inbox: {shared_title_or_domain}`

#### 通常起動時
- `inbox: {manual_title_or_url_or_first_line}`

### REQ-031
Issue 本文は、GitHub 側の Issue Form に入力値を埋める方針とすること。

### REQ-032
PWA 側は、長い AI 向け固定文を持たず、GitHub 側テンプレートへ寄せること。

### REQ-033
PWA 側は、`template=` クエリを付けて Issue Form を選択できること。

---

## 11.5 GitHub 設定補助機能

### REQ-040
アプリ内に「GitHub設定補助」画面を持つこと。

### REQ-041
以下のコピーボタンを提供すること。

- `inbox-share.yml` をコピー
- `inbox-manual.yml` をコピー
- `config.yml` をコピー
- 設置手順をコピー

### REQ-042
他人が使う場合のために、アプリ内に使い方説明を表示すること。

---

## 12. Issue Template 要件

### REQ-050
GitHub 側に以下の Issue Form を置く前提で設計すること。

- `.github/ISSUE_TEMPLATE/inbox-share.yml`
- `.github/ISSUE_TEMPLATE/inbox-manual.yml`

### REQ-051
`config.yml` により blank issue を抑制できる設計とすること。

### REQ-052
`inbox-share.yml` は共有起動に最適化し、以下の入力を持つこと。

- URL
- shared_title
- shared_text
- memo（初期値あり）

### REQ-053
`inbox-manual.yml` は通常起動に最適化し、以下の入力を持つこと。

- URL
- manual_title
- manual_text
- memo

---

## 13. セキュリティ要件

## 13.1 基本方針
本アプリは、GitHub Pages 上で公開される静的PWAである。  
そのため、**クライアントに秘密情報を持たせない**ことを最重要方針とする。

### REQ-060
GitHub API 用トークン、PAT、OAuth シークレット等をクライアントに保持してはならない。

### REQ-061
GitHub API を使った直接書き込みは行わないこと。

### REQ-062
保存先として受け付ける URL は、`https://github.com/{owner}/{repo}` 形式のみとすること。

### REQ-063
`github.com` 以外のホストへ遷移する Issue 生成を許可してはならない。

### REQ-064
Issue は自動送信してはならないこと。  
必ず GitHub の Issue 作成画面を経由し、ユーザーが最終確認すること。

### REQ-065
共有や手入力から渡された `Text` は長さ上限を持つこと。  
長すぎる場合は切り詰めること。

### REQ-066
アプリ内で、機微情報を貼らないよう注意文を表示すること。

### REQ-067
PWA は HTTPS 前提で動作すること。

---

## 14. UX 要件

### REQ-070
共有起動時は、最短で GitHub Issue 作成画面へ到達できること。

### REQ-071
通常起動時は、URLや知見を貼り付けやすい最小フォームであること。

### REQ-072
初回起動時または設定画面で、使い方を確認できること。

### REQ-073
見た目の凝りよりも、分かりやすさと壊れにくさを優先すること。

---

## 15. テスト要件

### REQ-080
Core の以下は unit test を持つこと。

- GitHub リポジトリ URL 解析
- title 生成
- Issue Form 用の query 組み立て
- 文字列切り詰め
- 入力値の空欄処理

### REQ-081
共有起動と通常起動の主要導線は E2E テストを持つこと。

### REQ-082
最低限の E2E 対象は以下とする。

- 共有起動時に適切な GitHub issue URL へ遷移する
- 通常起動時にフォーム入力から適切な issue URL へ遷移する

---

## 16. CI / 開発環境要件

### REQ-090
CI で以下を実行すること。

- lint
- test
- build

### REQ-091
ESLint を導入すること。

### REQ-092
Vitest を導入すること。

### REQ-093
Playwright を導入すること。

---

## 17. 受け入れ条件

以下を満たしたとき、初期版は完成とみなす。

- 保存先リポジトリ URL を設定できる
- 共有起動時に即 GitHub Issue 作成画面へ遷移できる
- 通常起動時に手入力から GitHub Issue 作成画面へ遷移できる
- GitHub 設定補助としてテンプレコピーボタンがある
- Core & Extensions の依存方向が守られている
- lint / test / build が通る
- TypeScript strict が有効である
- クライアントに秘密情報を保持していない

---

## 18. 将来拡張

将来的には以下を検討可能とするが、初期版では扱わない。

- 複数リポジトリ対応
- Issue テンプレートの自動設置
- ブラウザ拡張化
- GitHub API 連携版
- ローカル AI 連携の強化
- Android ショートカットやウィジェット対応