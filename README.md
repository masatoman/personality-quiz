# 心理学×英語学習アプリ「EngType」

<div align="center">
  <img src="public/logo.png" alt="EngTypeロゴ" width="200" />
  <p><strong>教えることで学び、貢献することで成長する新しい英語学習エコシステム</strong></p>
</div>

## 📚 プロジェクト概要

「EngType」は行動心理学の知見を活用し、ギバー（与える人）・マッチャー（互恵的な人）・テイカー（受け取る人）という心理タイプに基づいた英語学習プラットフォームです。ユーザーは自分の心理タイプを診断し、それに合った学習方法や貢献方法を見つけることで、より効果的かつ持続的な学習体験を得ることができます。

### 主な特徴

- **心理タイプ診断**: インタラクティブな質問に答えることで、ユーザーの心理タイプを判定
- **ギバースコアシステム**: 教材作成やフィードバック提供など、コミュニティへの貢献度を数値化
- **カスタマイズされた学習体験**: 心理タイプに合わせた教材や学習方法の推奨
- **コミュニティ貢献**: 教材作成、フィードバック提供、質問回答などで他のユーザーをサポート
- **ゲーミフィケーション**: バッジ、レベル、ポイントシステムによる学習モチベーションの維持

## 🛠️ 開発環境のセットアップ

### 前提条件

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (v18以上)

### クイックスタート

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/engtype.git
cd engtype

# セットアップスクリプトを実行
chmod +x dev-setup.sh
./dev-setup.sh
```

セットアップスクリプトは以下を自動で行います：
1. 環境変数の設定
2. Dockerコンテナ（Supabase環境）の起動
3. データベースの初期化
4. 依存関係のインストール（必要な場合）

### 手動セットアップ

```bash
# 環境変数ファイルを作成
cp .env.example .env.local

# Dockerコンテナを起動
docker-compose up -d

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

### 開発環境へのアクセス

- Next.jsアプリ: http://localhost:3000
- Supabase REST API: http://localhost:3001
- Supabase Auth: http://localhost:9999
- Supabase Storage: http://localhost:9000

### テストアカウント（開発環境用）

| アカウント | メールアドレス | タイプ | 説明 |
|------------|----------------|--------|------|
| 管理者 | admin@example.com | ギバー | 管理者権限を持つユーザー |
| ギバー太郎 | giver@example.com | ギバー | 教材作成や支援に積極的 |
| マッチャー花子 | matcher@example.com | マッチャー | 互恵的な交流を好む |
| テイカー次郎 | taker@example.com | テイカー | 効率的に学びたい |

開発環境では、パスワードは任意の文字列で認証可能です。

## 📁 プロジェクト構成

```
engtype/
├── docker/                   # Docker関連ファイル
│   ├── init-scripts/         # DB初期化スクリプト
│   └── Dockerfile.dev        # 開発用Dockerfile
├── public/                   # 静的ファイル
├── src/                      # ソースコード
│   ├── app/                  # Next.js App Router
│   ├── components/           # Reactコンポーネント
│   ├── lib/                  # ユーティリティ関数
│   ├── types/                # TypeScript型定義
│   └── utils/                # ヘルパー関数
├── .env.example              # 環境変数テンプレート
├── docker-compose.yml        # Docker Compose設定
├── dev-setup.sh              # 開発環境セットアップスクリプト
└── README.md                 # プロジェクト説明
```

## 🧪 テスト

```bash
# ユニットテスト実行
npm test

# E2Eテスト実行
npm run test:e2e

# テストカバレッジレポート生成
npm run test:coverage
```

## 🛑 トラブルシューティング

### データベース接続エラー

```bash
# PostgreSQLコンテナのログを確認
docker-compose logs postgres

# データベースをリセット
docker-compose down -v
docker-compose up -d
```

### Supabaseサービスへの接続問題

```bash
# 各サービスのステータスを確認
docker-compose ps

# すべてのサービスを再起動
docker-compose restart
```

### 開発環境の完全リセット

```bash
# コンテナとボリュームを削除
docker-compose down -v

# node_modulesを削除
rm -rf node_modules
rm -rf .next

# セットアップを再実行
./dev-setup.sh
```

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルをご覧ください。

## 📞 サポート

問題や質問がある場合は、[Issues](https://github.com/yourusername/engtype/issues) セクションに投稿してください。 
