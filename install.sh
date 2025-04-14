#!/bin/bash

# カラー設定
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ヘッダー表示関数
print_header() {
  echo -e "\n${BLUE}$1${NC}"
  echo "========================================"
}

# エラーチェック関数
check_error() {
  if [ $? -ne 0 ]; then
    echo -e "${RED}エラー: $1${NC}"
    exit 1
  fi
}

# コマンド存在確認関数
check_command() {
  if ! command -v $1 &> /dev/null; then
    echo -e "${RED}エラー: $1 がインストールされていません${NC}"
    echo -e "インストール方法: $2"
    exit 1
  fi
}

# 前提条件のチェック
print_header "1️⃣ 前提条件のチェック"
check_command "docker" "https://docs.docker.com/get-docker/"
check_command "docker-compose" "https://docs.docker.com/compose/install/"
check_command "node" "https://nodejs.org/"
check_command "npm" "https://nodejs.org/"

# 環境変数ファイルの設定
print_header "2️⃣ 環境変数の設定"
if [ ! -f .env ]; then
  echo -e "${YELLOW}環境変数ファイルを.env.exampleから作成します...${NC}"
  cp .env.example .env
  check_error "環境変数ファイルの作成に失敗しました"
  echo -e "${GREEN}✅ .env ファイルを作成しました${NC}"
else
  echo -e "${YELLOW}既存の .env ファイルが見つかりました。上書きしますか？ [y/N]${NC}"
  read overwrite
  if [[ "$overwrite" == "y" || "$overwrite" == "Y" ]]; then
    cp .env.example .env
    check_error "環境変数ファイルの上書きに失敗しました"
    echo -e "${GREEN}✅ .env ファイルを上書きしました${NC}"
  else
    echo -e "${YELLOW}既存の .env ファイルを使用します${NC}"
  fi
fi

# 依存関係のインストール
print_header "3️⃣ 依存関係のインストール"
echo -e "npmパッケージをインストールしています..."
npm install
check_error "npm installの実行に失敗しました"
echo -e "${GREEN}✅ npmパッケージをインストールしました${NC}"

# Dockerコンテナの起動
print_header "4️⃣ Dockerコンテナの起動"
echo -e "Docker コンテナを起動しています..."
docker-compose down -v # 既存のコンテナとボリュームを削除
docker-compose up -d
check_error "Docker Composeの起動に失敗しました"
echo -e "${GREEN}✅ Docker コンテナを起動しました${NC}"

# データベースの初期化待機
print_header "5️⃣ データベースの初期化"
echo -e "データベースの初期化を待機しています..."
sleep 30
docker-compose exec postgres psql -U postgres -d giver_english_db -c "SELECT COUNT(*) FROM pg_tables;"
check_error "データベースの初期化確認に失敗しました"
echo -e "${GREEN}✅ データベースが初期化されました${NC}"

# テスト環境のセットアップ
print_header "6️⃣ テスト環境のセットアップ"
echo -e "Playwrightをインストールしています..."
npx playwright install
check_error "Playwrightのインストールに失敗しました"
echo -e "${GREEN}✅ テスト環境をセットアップしました${NC}"

# セットアップ完了
print_header "🎉 セットアップ完了"
echo -e "${GREEN}開発環境のセットアップが完了しました！${NC}\n"
echo -e "使用可能なコマンド:"
echo -e "・開発サーバー起動: ${YELLOW}npm run dev${NC}"
echo -e "・テスト実行: ${YELLOW}npm test${NC}"
echo -e "・E2Eテスト実行: ${YELLOW}npm run test:e2e${NC}"
echo -e "・環境停止: ${YELLOW}docker-compose down${NC}"
echo -e "・環境再起動: ${YELLOW}docker-compose restart${NC}"
echo -e "・DB初期化: ${YELLOW}docker-compose down -v && docker-compose up -d${NC}\n"

echo -e "アクセス情報:"
echo -e "・Next.jsアプリ: ${YELLOW}http://localhost:${PORT:-3000}${NC}"
echo -e "・Supabase REST API: ${YELLOW}http://localhost:${SUPABASE_API_PORT:-3001}${NC}"
echo -e "・Supabase Auth: ${YELLOW}http://localhost:${SUPABASE_AUTH_PORT:-9999}${NC}"
echo -e "・Supabase Storage: ${YELLOW}http://localhost:${SUPABASE_STORAGE_PORT:-9000}${NC}"
echo -e "・API Server: ${YELLOW}http://localhost:${API_SERVER_PORT:-8080}${NC}\n"

echo -e "テストアカウント:"
echo -e "・管理者: ${YELLOW}admin@example.com${NC}"
echo -e "・ギバー: ${YELLOW}giver@example.com${NC}"
echo -e "・マッチャー: ${YELLOW}matcher@example.com${NC}"
echo -e "・テイカー: ${YELLOW}taker@example.com${NC}"
echo -e "（開発環境では任意のパスワードでログインできます）\n"

echo -e "${GREEN}Happy coding! 🚀${NC}" 