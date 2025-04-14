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

## 🚀 クイックスタート

1. リポジトリをクローン:
```bash
git clone https://github.com/your-repo/shiftwith.git
cd shiftwith
```

2. インストールスクリプトを実行:
```bash
chmod +x install.sh
./install.sh
```

これで以下の環境が自動的にセットアップされます：
- Next.jsアプリケーション
- Supabaseサービス（Auth, Storage, REST API）
- PostgreSQLデータベース
- テスト環境（Jest, Playwright）
- 開発用APIサーバー

## 📝 環境変数

環境変数は `.env` ファイルで管理されています。デフォルト値は `.env.example` から自動的にコピーされますが、必要に応じて以下の値をカスタマイズできます：

```bash
# アプリケーションポート
PORT=3000                    # Next.jsアプリ
SUPABASE_API_PORT=3001      # Supabase REST API
SUPABASE_AUTH_PORT=9999     # Supabase Auth
SUPABASE_STORAGE_PORT=9000  # Supabase Storage
API_SERVER_PORT=8080        # 開発用APIサーバー
E2E_TEST_PORT=3002         # E2Eテスト用
DATABASE_PORT=5432         # PostgreSQL
```

## 🛠️ 開発コマンド

開発に使用する主なコマンド：

```bash
# 開発サーバーの起動
npm run dev

# テストの実行
npm test                 # ユニットテスト
npm run test:e2e        # E2Eテスト

# Docker環境の管理
docker-compose down     # 環境の停止
docker-compose restart  # 環境の再起動
docker-compose down -v  # DBを含む環境の初期化
```

## 🔑 テストアカウント

開発環境では以下のテストアカウントが利用可能です：

- 管理者: admin@example.com
- ギバー: giver@example.com
- マッチャー: matcher@example.com
- テイカー: taker@example.com

※開発環境では任意のパスワードでログインできます

## 📚 その他のドキュメント

詳細な情報は以下のドキュメントを参照してください：

- [開発ガイド](./docs/02_開発ガイド/)
- [テスト標準](./docs/02_開発ガイド/02_テスト標準.md)
- [デプロイメントガイド](./docs/02_開発ガイド/06_デプロイメント構成図.md)

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
