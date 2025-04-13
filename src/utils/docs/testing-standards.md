# ShiftWith プロジェクト テスト標準実装ガイド

このドキュメントでは、ShiftWithプロジェクトで実装されたテスト標準とコロケーション方式への移行手順について説明します。

## 1. テスト標準の概要

ShiftWithプロジェクトでは、以下のテスト標準を実装しています：

1. **テスト構造の標準化**
   - 各ディレクトリのテスト命名規則適用
   - コロケーション方式への移行
   - CIパイプラインでのテスト実行確認

2. **テスト種類ごとの標準テンプレート**
   - ユニットテストテンプレート
   - コンポーネントテストテンプレート
   - 統合テストテンプレート
   - E2Eテストテンプレート

3. **テストカバレッジ設定**
   - Jest設定の最適化
   - カバレッジレポート生成と可視化

## 2. コロケーション方式への移行

### 2.1 コロケーション方式とは

コロケーション方式では、テストファイルがテスト対象と同じディレクトリに配置されます。これにより：

- テストファイルとソースファイルの関連性が明確になる
- コード移動時の追跡が容易になる
- テストカバレッジの視認性が向上する

### 2.2 移行方法

移行には、以下のスクリプトを使用します：

```bash
# コンポーネントテストを移行
npm run migrate:tests -- --components

# ユーティリティテストを移行
npm run migrate:tests -- --utils

# すべてのテストを移行
npm run migrate:tests -- --all

# 変更せずに移行のシミュレーションを実行（ドライラン）
npm run migrate:tests:dry
```

### 2.3 移行状況の確認

移行の進捗状況を確認するには：

```bash
# 移行状況レポートを生成
npm run migration:report
```

これにより、各ディレクトリのテストファイル移行状況がレポートされます。

## 3. テストカバレッジレポート

テストカバレッジを確認する方法：

```bash
# テストカバレッジを計測
npm run test:coverage

# テストカバレッジレポートを生成して表示
npm run test:coverage:report
```

### 3.1 カバレッジ目標

プロジェクトでは以下のカバレッジ閾値を設定しています：

- ステートメントカバレッジ: 80%以上
- ブランチカバレッジ: 70%以上
- 関数カバレッジ: 80%以上
- 行カバレッジ: 80%以上

## 4. CIパイプラインでのテスト

CI環境（GitHub Actions）でテストを実行するための設定が実装されています。

### 4.1 ローカルでのCI検証

CIパイプラインをローカルで検証するには：

```bash
# CIテスト実行をシミュレーション
npm run test:verify-ci

# CI用設定でテスト実行
npm run test:ci
```

### 4.2 プルリクエスト時の自動テスト

プルリクエスト時に自動的にテストが実行され、以下のチェックが行われます：

- 全テストの実行
- コードカバレッジの測定
- カバレッジ閾値の確認
- カバレッジレポートの生成

## 5. テストの生成

新しいテストを作成するには：

```bash
# コンポーネントテスト生成
npm run generate:test -- --component=ComponentName

# ユーティリティテスト生成
npm run generate:test -- --util=UtilityName

# 統合テスト生成
npm run generate:test -- --integration=FeatureName

# E2Eテスト生成
npm run generate:test -- --e2e=FlowName

# Cypressテスト生成
npm run generate:test -- --cypress=FeatureName
```

## 6. 今後の課題

今後の課題として以下の点に取り組む予定です：

1. テスト実行の高速化（キャッシュ最適化）
2. フレームワーク間の連携強化（Jest/Cypress/Playwright）
3. VSCodeとの連携機能強化（テスト実行・デバッグ）
4. テスト環境のDockerコンテナ化

## 7. 参考リソース

- [Jest 公式ドキュメント](https://jestjs.io/ja/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Playwright](https://playwright.dev/docs/intro)
- [Cypress](https://docs.cypress.io/guides/overview/why-cypress)
- [Next.js テスト](https://nextjs.org/docs/testing) 