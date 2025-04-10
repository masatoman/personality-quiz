#!/bin/bash

# 環境変数の読み込み
source .env

# バックアップディレクトリの作成
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

# バックアップファイル名の設定
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/quiz_app_$TIMESTAMP.sql"

# データベースのバックアップ
echo "Creating database backup..."
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_FILE

# 圧縮
echo "Compressing backup file..."
gzip $BACKUP_FILE

echo "Backup completed: ${BACKUP_FILE}.gz"

# 30日以上前のバックアップを削除
find $BACKUP_DIR -name "quiz_app_*.sql.gz" -mtime +30 -delete 