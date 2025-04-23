#!/bin/bash

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 環境変数の読み込み
if [ -f .env ]; then
    source .env
else
    echo -e "${RED}.envファイルが見つかりません${NC}"
    exit 1
fi

# マイグレーションファイルの検証
echo -e "${YELLOW}マイグレーションファイルを検証中...${NC}"
migration_dir="./migrations"

if [ ! -d "$migration_dir" ]; then
    echo -e "${RED}マイグレーションディレクトリが見つかりません${NC}"
    exit 1
fi

# マイグレーションファイルの命名規則チェック
echo "マイグレーションファイルの命名規則をチェック中..."
for file in $migration_dir/*.sql; do
    if [[ ! $file =~ ^$migration_dir/[0-9]{14}_[a-z0-9_]+\.sql$ ]]; then
        echo -e "${RED}無効なマイグレーションファイル名: $file${NC}"
        echo "ファイル名は'YYYYMMDDHHMMSS_description.sql'の形式である必要があります"
        exit 1
    fi
done

# マイグレーションの実行時間計測
echo "マイグレーション実行時間を計測中..."
start_time=$(date +%s)

# ドライランの実行
echo "マイグレーションのドライランを実行中..."
npm run migration:dry-run
if [ $? -ne 0 ]; then
    echo -e "${RED}マイグレーションのドライランに失敗しました${NC}"
    exit 1
fi

end_time=$(date +%s)
execution_time=$((end_time - start_time))

if [ $execution_time -gt 60 ]; then
    echo -e "${YELLOW}警告: マイグレーションの実行に${execution_time}秒かかりました${NC}"
    echo "実行時間が1分を超えています。パフォーマンスの最適化を検討してください。"
else
    echo -e "${GREEN}マイグレーションの実行時間は${execution_time}秒でした${NC}"
fi

# ロールバックスクリプトの存在確認
echo "ロールバックスクリプトを確認中..."
for file in $migration_dir/*_up.sql; do
    down_file="${file%_up.sql}_down.sql"
    if [ ! -f "$down_file" ]; then
        echo -e "${YELLOW}警告: $file に対応するロールバックスクリプトが見つかりません${NC}"
    fi
done

echo -e "${GREEN}マイグレーションチェックが完了しました${NC}" 