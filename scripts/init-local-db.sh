#!/bin/bash

# エラー時に停止
set -e

echo "🚀 ローカルデータベース環境を初期化します..."

# Docker環境の状態確認
if ! docker info > /dev/null 2>&1; then
    echo "❌ Dockerが起動していません。Dockerを起動してください。"
    exit 1
fi

# 環境変数ファイルの存在確認
if [ ! -f .env ]; then
    echo "❌ .envファイルが見つかりません。.env.templateをコピーして設定してください。"
    exit 1
fi

# コンテナの停止と削除（もし存在する場合）
echo "🧹 既存のコンテナをクリーンアップしています..."
docker-compose down -v > /dev/null 2>&1 || true

# コンテナの起動
echo "📦 コンテナを起動しています..."
docker-compose up -d

# データベースの準備ができるまで待機
echo "⏳ データベースの準備ができるまで待機しています..."
until docker-compose exec -T supabase-db pg_isready -U postgres > /dev/null 2>&1; do
    echo "データベースの準備中..."
    sleep 2
done

echo "✅ データベース環境の初期化が完了しました！"
echo "
以下のサービスが利用可能です：
- PostgreSQL: localhost:5432
- Auth: localhost:${SUPABASE_AUTH_PORT}
- REST API: localhost:${SUPABASE_API_PORT}
- Realtime: localhost:${SUPABASE_REALTIME_PORT}
" 