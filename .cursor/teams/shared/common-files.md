# 共通ファイルと担当範囲ガイドライン

## 共通設定ファイル（全チーム必読）

1. プロジェクト設定
   - `package.json`: 依存関係管理
   - `tsconfig.json`: TypeScript設定
   - `.eslintrc.js`: コード品質ルール
   - `.prettierrc`: コードフォーマット
   - `.env.example`: 環境変数テンプレート

2. ドキュメント
   - `docs/01_プロジェクト概要/`
     - `基本設計.md`
     - `アーキテクチャ.md`
     - `開発ガイドライン.md`
   - `docs/02_API仕様/`
     - `openapi.yaml`
     - `認証仕様.md`
   - `docs/03_進捗管理/`
     - `TODO.md`
     - `完了機能リスト.md`

3. 型定義
   - `src/types/common/`: 共通型定義
   - `src/types/utils/`: ユーティリティ型

## チーム別担当範囲

1. DBチーム専用
   - `src/lib/db/`: データベース操作
   - `prisma/`: スキーマ定義
   - `src/types/db/`: DB固有の型定義
   - `src/lib/migrations/`: マイグレーション

2. APIチーム専用
   - `src/app/api/`: APIエンドポイント
   - `src/lib/api/`: API共通ロジック
   - `src/types/api/`: API型定義
   - `src/middleware/`: ミドルウェア
   - `src/lib/validation/`: バリデーション

3. クライアントチーム専用
   - `src/app/`: ページコンポーネント
   - `src/components/`: UIコンポーネント
   - `src/styles/`: スタイル定義
   - `src/hooks/`: カスタムフック
   - `src/utils/client/`: クライアント用ユーティリティ

4. インフラチーム専用
   - `.github/`: CI/CD設定
   - `infra/`: インフラ構成
   - `monitoring/`: 監視設定
   - `docker/`: コンテナ設定

## 共同管理ディレクトリ

1. `src/utils/shared/`
   - 全チームで共有するユーティリティ関数
   - 変更時は全チームでレビュー必須

2. `src/config/`
   - アプリケーション設定
   - 環境変数の型定義
   - 定数定義

3. `src/types/shared/`
   - 共有型定義
   - チーム間で共有するインターフェース

## ファイル変更ルール

1. 専用ディレクトリ
   - 担当チームのみが変更可能
   - 他チームは PRレビューのみ実施

2. 共同管理ディレクトリ
   - 変更時は全チームの承認が必要
   - 変更影響範囲の事前確認必須
   - 変更後のテスト実行必須

3. 共通設定ファイル
   - インフラチームが主担当
   - 変更時は全チームへの通知必須
   - 環境変数追加時は`.env.example`の更新必須 