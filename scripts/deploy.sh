#!/bin/bash

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 環境変数の検証
echo -e "${YELLOW}環境変数を検証中...${NC}"
npm run validate-env
if [ $? -ne 0 ]; then
    echo -e "${RED}環境変数の検証に失敗しました。デプロイを中止します。${NC}"
    exit 1
fi

# 現在のブランチ名を取得
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# デプロイ前の確認
echo -e "${YELLOW}デプロイ前チェックを実行中...${NC}"

# テストの実行
echo "単体テストを実行中..."
npm run test
if [ $? -ne 0 ]; then
    echo -e "${RED}テストに失敗しました。デプロイを中止します。${NC}"
    exit 1
fi

# ビルドの実行
echo "ビルドを実行中..."
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}ビルドに失敗しました。デプロイを中止します。${NC}"
    exit 1
fi

# デプロイの実行
echo -e "${YELLOW}Vercelへデプロイを開始します...${NC}"
if [ "$BRANCH" = "main" ]; then
    echo "本番環境へデプロイします"
    vercel --prod
elif [ "$BRANCH" = "staging" ]; then
    echo "ステージング環境へデプロイします"
    vercel --env NODE_ENV=staging
else
    echo "開発環境へデプロイします"
    vercel
fi

# デプロイ結果の確認
if [ $? -eq 0 ]; then
    echo -e "${GREEN}デプロイが正常に完了しました${NC}"
else
    echo -e "${RED}デプロイに失敗しました${NC}"
    exit 1
fi

# ヘルスチェック
echo "ヘルスチェックを実行中..."
sleep 10  # デプロイ完了を待機

if [ "$BRANCH" = "main" ]; then
    HEALTH_URL="https://your-production-url.com/api/health"
elif [ "$BRANCH" = "staging" ]; then
    HEALTH_URL="https://staging.your-url.com/api/health"
else
    HEALTH_URL="https://dev.your-url.com/api/health"
fi

curl -f $HEALTH_URL
if [ $? -eq 0 ]; then
    echo -e "${GREEN}ヘルスチェック成功${NC}"
else
    echo -e "${RED}ヘルスチェック失敗。ロールバックを検討してください。${NC}"
    exit 1
fi 