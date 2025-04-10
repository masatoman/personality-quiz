#!/bin/bash

# カラー設定
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 前提条件の確認
print_header() {
  echo -e "${GREEN}$1${NC}"
  echo "========================================"
}

check_command() {
  if ! command -v $1 &> /dev/null; then
    echo -e "${RED}エラー: $1 がインストールされていません。${NC}"
    echo -e "インストール方法: $2"
    exit 1
  fi
}

# Docker と Docker Compose の確認
print_header "前提条件のチェック"
check_command "docker" "https://docs.docker.com/get-docker/"
check_command "docker-compose" "https://docs.docker.com/compose/install/"

# 環境変数ファイルの作成
print_header "環境変数ファイルの設定"
if [ ! -f .env.local ]; then
  echo -e "${YELLOW}環境変数ファイルを.env.exampleから作成します...${NC}"
  cp .env.example .env.local
  echo -e "${GREEN}✅ .env.local ファイルを作成しました${NC}"
else
  echo -e "${YELLOW}既存の .env.local ファイルが見つかりました。上書きしますか？ [y/N]${NC}"
  read overwrite
  if [[ "$overwrite" == "y" || "$overwrite" == "Y" ]]; then
    cp .env.example .env.local
    echo -e "${GREEN}✅ .env.local ファイルを上書きしました${NC}"
  else
    echo -e "${YELLOW}既存の .env.local ファイルを使用します${NC}"
  fi
fi

# Dockerコンテナの起動
print_header "開発環境コンテナの起動"
echo -e "Docker コンテナを起動しています..."
docker-compose up -d
if [ $? -ne 0 ]; then
  echo -e "${RED}エラー: Docker Compose の起動に失敗しました${NC}"
  exit 1
else
  echo -e "${GREEN}✅ Docker コンテナを起動しました${NC}"
fi

# データベースの初期化確認
print_header "データベースの初期化確認"
echo -e "データベースが正常に初期化されるまで30秒待機しています..."
sleep 30
docker-compose exec postgres psql -U postgres -d giver_english_db -c "SELECT COUNT(*) FROM users;"
if [ $? -ne 0 ]; then
  echo -e "${RED}警告: データベースの初期化に問題があるようです${NC}"
  echo -e "${YELLOW}PostgreSQLコンテナのログを確認してください: docker-compose logs postgres${NC}"
else
  echo -e "${GREEN}✅ データベースが正常に初期化されました${NC}"
fi

# Next.jsアプリのインストールと起動
print_header "Next.jsアプリの準備"
if [ ! -d "node_modules" ]; then
  echo -e "依存関係をインストールしています..."
  npm install
  if [ $? -ne 0 ]; then
    echo -e "${RED}エラー: npm install の実行に失敗しました${NC}"
    exit 1
  else
    echo -e "${GREEN}✅ 依存関係をインストールしました${NC}"
  fi
else
  echo -e "${YELLOW}node_modules が既に存在します. 依存関係のインストールをスキップします${NC}"
fi

# セットアップ完了
print_header "セットアップ完了"
echo -e "${GREEN}開発環境のセットアップが完了しました！${NC}"
echo -e "以下のコマンドで開発サーバーを起動できます:"
echo -e "${YELLOW}npm run dev${NC}"
echo ""
echo -e "アクセス情報:"
echo -e "・Next.jsアプリ: ${YELLOW}http://localhost:3000${NC}"
echo -e "・Supabase REST API: ${YELLOW}http://localhost:3001${NC}"
echo -e "・Supabase Auth: ${YELLOW}http://localhost:9999${NC}"
echo -e "・Supabase Storage: ${YELLOW}http://localhost:9000${NC}"
echo ""
echo -e "テストアカウント:"
echo -e "・管理者: ${YELLOW}admin@example.com${NC}"
echo -e "・ギバー: ${YELLOW}giver@example.com${NC}"
echo -e "・マッチャー: ${YELLOW}matcher@example.com${NC}"
echo -e "・テイカー: ${YELLOW}taker@example.com${NC}"
echo -e "（開発環境では任意のパスワードでログインできます）"
echo ""
echo -e "環境停止コマンド: ${YELLOW}docker-compose down${NC}"
echo -e "環境再起動コマンド: ${YELLOW}docker-compose restart${NC}"
echo -e "データベースリセットコマンド: ${YELLOW}docker-compose down -v && docker-compose up -d${NC}"
echo ""
echo -e "${GREEN}Have fun coding! 🚀${NC}" 