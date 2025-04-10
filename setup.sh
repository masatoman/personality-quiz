#!/bin/bash

echo "🚀 開発環境のセットアップを開始します..."

# 依存関係のインストール
echo "📦 依存パッケージをインストール中..."
pnpm install

# 環境変数の設定
echo "🔧 環境変数を設定中..."
if [ ! -f .env.local ]; then
  cp .env.example .env.local
fi

# データベースのセットアップ
echo "💾 データベースをセットアップ中..."
php src/api/setup_tables.php

# 開発サーバーの起動
echo "🌐 開発サーバーを起動中..."
npm run dev &
cd src/api && php -S localhost:8080

echo "✅ セットアップが完了しました！" 