# プロジェクトスタートアップガイド

## 1. 初期セットアップ

### 1.1 リポジトリのセットアップ
```bash
# リポジトリのクローン
git clone [your-repository-url]
cd [repository-name]

# 必要なブランチの作成
git checkout -b develop
git push origin develop
```

### 1.2 環境構築
```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集して必要な値を設定

# 開発サーバーの起動確認
npm run dev
```

## 2. Cursor設定

### 2.1 Cursorエージェントの初期化
1. Cursorを起動
2. プロジェクトフォルダを開く
3. `.cursor/teams/shared/agent-config.md` を確認
4. エージェントに以下のファイルを読み込ませる：
   - `.cursor/teams/shared/development-guidelines.md`
   - `.cursor/teams/shared/startup-checklist.md`
   - `.cursor/teams/[your-team]/task-prompt.md`

### 2.2 VSCode設定の同期
```bash
# .vscode/settings.jsonの作成
cp .vscode/settings.example.json .vscode/settings.json

# 拡張機能のインストール
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
# その他必要な拡張機能をインストール
```

## 3. チーム別セットアップ

### 3.1 クライアントチーム
- `src/app` ディレクトリの構造確認
- コンポーネント設計ドキュメントの確認
- スタイルガイドの確認

### 3.2 APIチーム
- `src/app/api` ディレクトリの構造確認
- APIドキュメントの確認
- テスト環境のセットアップ

### 3.3 DBチーム
- データベーススキーマの確認
- マイグレーションスクリプトの確認
- シードデータの準備

### 3.4 インフラチーム
- デプロイメントフローの確認
- 監視設定の確認
- セキュリティ設定の確認

## 4. 開発フロー確認

### 4.1 基本的な開発フロー
1. タスクの確認（`.cursor/teams/[your-team]/task-prompt.md`）
2. ブランチの作成（`feature/[task-name]`）
3. 実装
4. テスト
5. PRの作成
6. レビュー依頼

### 4.2 コミュニケーションツールのセットアップ
- Slackチャンネルへの参加
- GitHub Projectsの確認
- チーム別ミーティングスケジュールの確認

## 5. 確認事項

### 5.1 ドキュメント
- [ ] プロジェクト概要の理解
- [ ] 技術スタックの確認
- [ ] コーディング規約の確認
- [ ] テスト方針の確認

### 5.2 アクセス権限
- [ ] GitHubリポジトリへのアクセス
- [ ] 開発環境へのアクセス
- [ ] 必要なサービスへのアクセス

### 5.3 コミュニケーション
- [ ] チームメンバーとの顔合わせ
- [ ] 連絡先の共有
- [ ] 緊急時の連絡フローの確認

## 6. トラブルシューティング

問題が発生した場合は、以下の順序で対応してください：

1. `.cursor/teams/shared/faq.md` の確認
2. チームのテックリードに相談
3. プロジェクトマネージャーに報告

## 7. 次のステップ

セットアップが完了したら：

1. デイリースタンドアップ（10:00-10:15）に参加
2. 担当タスクの確認
3. 最初のタスクに着手

不明点があれば、いつでもチームのテックリードにご相談ください。 