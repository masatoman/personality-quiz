#!/bin/bash

# 本番環境用の環境変数を使用
echo "Using production environment..."
export NODE_ENV=production

# ビルド
echo "Building the project..."
npm run build

# Hostingerにデプロイ
echo "Deploying to Hostinger..."

# フロントエンドのデプロイ
echo "Deploying frontend files..."
scp -P 65002 -r out/* u969053517@153.92.10.169:/home/u969053517/domains/virtualph-academy.com/public_html/quiz/

# APIファイルの転送
echo "Transferring API files..."
scp -P 65002 -r api/* u969053517@153.92.10.169:/home/u969053517/domains/virtualph-academy.com/public_html/quiz/api/

# 本番環境用の環境変数ファイルを転送
echo "Transferring production environment file..."
scp -P 65002 .env.production u969053517@153.92.10.169:/home/u969053517/domains/virtualph-academy.com/public_html/quiz/api/.env

# データベース接続テスト
echo "Testing database connection..."
curl -s https://virtualph-academy.com/quiz/api/test_db.php

echo "Deployment completed!" 