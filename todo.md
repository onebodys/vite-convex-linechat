# TODO

## ツールとプロジェクト構成
- [x] Convex CLIとクライアントパッケージをインストールし、Convexのプロジェクト構造（スキーマ、関数、`.env`の雛形）を用意する
  - [x] `npx convex init` ではなく `npx convex dev --once --configure=new`
- [x] Tailwind CSSとshadcn/uiを導入し、`tailwind.config.js`、PostCSS、グローバルスタイル、shadcnジェネレーターを設定する
- [x] LINEのグリーンを意識したカラーパレットを再現するデザイントークン（プライマリ/セカンダリカラー、グラデーション、ダークモード）を定義する
  - `src/index.css` にブランドトークンを追加し、`src/lib/theme/tokens.ts` で値を再利用できるようエクスポート
  - グラデーション用ユーティリティ（`.bg-primary-gradient` / `.bg-accent-gradient`）を用意し、`npm run lint` と手動の配色確認を実施予定
- [x] 必要な環境変数（`CONVEX_DEPLOYMENT`、LINEチャネルのシークレット、Webhook URL）を整理してドキュメント化する

## Convexバックエンド
- [x] 会話データを保存するスキーマ（ユーザーメッセージ、配信ステータス、メタデータ）を設計する
- [x] 送信メッセージの作成/スケジュールと受信イベントの記録を行うミューテーションを実装する
- [x] 直近のチャット履歴や送信ステータスを取得するクエリを実装する
- [x] Convexに保存したシークレットを使ってLINE Messaging API（push/reply）を呼び出すサーバーアクションを作成する
- [x] 失敗した送信のリトライやステータス同期を行うバックグラウンドジョブまたはスケジュール関数を追加する
- [ ] 再送結果をSlack等に通知する監視フックを用意する（要件次第）

## LINE Messaging API連携
- [x] LINE Messaging APIクライアントヘルパー（HTTPラッパー、エラーハンドリング、リトライ/バックオフ）を整備する
- [x] LINEのWebhookから受信したイベントを処理するConvexのHTTPアクションエンドポイントを公開する
- [x] WebhookのペイロードをConvexのストレージに保存し、UI更新をトリガーする
- [x] LINEからのリクエストに対する署名検証とセキュリティを確認する

## Reactフロントエンド（Vite + shadcn/ui）
- [ ] スターターUIをチャットレイアウト（メッセージ一覧、入力欄、ステータス表示）に差し替える
- [ ] Convexのクエリ/ミューテーションフック（`useQuery`、`useMutation`）を利用してリアルタイム更新を実装する
- [ ] shadcnのコンポーネントをLINEのブランドカラーに合わせてスタイリングする（ボタン、入力欄、チャットバブル）
- [ ] メッセージ送信時のローディング/エラー表示とオプティミスティック更新を追加する
- [ ] LINEチャネルのトークンを入力できる設定UI（任意で管理画面）を用意する
- [ ] 送信失敗時にトースト等でオペレーターに通知する
- [ ] 再送中・再送完了のステータスをリアルタイムで反映するためのサブスクリプション最適化

## テストとデプロイ
- [x] ローカル開発手順（Convex開発サーバー、ngrokによるWebhookトンネリング、`.env`設定）を追記する
- [ ] メッセージ送受信の流れを確認する最小限の結合テストまたは手動チェックリストを作成する
- [ ] デプロイ手順（Convex deploy、LINEチャネルWebhook設定、Vercel/Netlifyのビルド設定）を準備する

## 追加のToDo
- [ ] https://docs.convex.dev/functions/validation 見る限りオブジェクト型があるけど、DBにはStringで保存してなかったっけっか
- [x] サイドバーにはlastEventの内容ではなく、最後のメッセージを表示するようにしてほしい、最初の登録の時はlastEventでよく、lastMessageがなければlastEventを表示くらいのロジックが良いかな
