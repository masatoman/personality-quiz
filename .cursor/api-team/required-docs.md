# API・DBチーム 必須ドキュメント

## 1. 技術仕様書
- `.cursor/rules/team-api-rules.mdc`：チームの作業ルール
- `prisma/schema.prisma`：データベーススキーマ
- `src/lib/db.ts`：データベース接続層の実装
- `src/app/api/`：APIエンドポイントの実装

## 2. テスト仕様
- `src/lib/__tests__/db.test.ts`：DBテストケース
- `src/lib/__tests__/db-deploy.test.ts`：デプロイテスト

## 3. 設計ドキュメント
- `docs/api/openapi.yaml`：API仕様書
- `docs/db/er-diagram.md`：ERD図
- `docs/db/migration-guide.md`：マイグレーションガイド

## 4. セキュリティ要件
- `docs/security/auth-flow.md`：認証フロー
- `docs/security/data-protection.md`：データ保護方針

## 5. 監視・運用
- `docs/monitoring/metrics.md`：監視指標
- `docs/monitoring/alerts.md`：アラート設定

## 6. デプロイメント
- `docs/deployment/checklist.md`：デプロイチェックリスト
- `docs/deployment/rollback.md`：ロールバック手順 