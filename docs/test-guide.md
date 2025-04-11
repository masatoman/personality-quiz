# ShiftWithプロジェクト テスト総合ガイド

このドキュメントは、ShiftWithプロジェクトにおけるテスト関連の情報を集約したものです。テストの作成、実行、設定、トラブルシューティングに関する情報を1つの場所で提供します。

## 目次

1. [テスト関連ファイルの場所](#テスト関連ファイルの場所)
2. [テスト標準化ルール](#テスト標準化ルール)
3. [テスト実行方法](#テスト実行方法)
4. [テスト設定ファイル](#テスト設定ファイル)
5. [TypeScript型定義](#typescript型定義)
6. [テストのトラブルシューティング](#テストのトラブルシューティング)
7. [参照ドキュメント](#参照ドキュメント)

## テスト関連ファイルの場所

### コードとテストファイル

| 対象 | テストファイルの場所 | 命名規則 | 使用ツール |
|------|-------------------|---------|---------|
| ユーティリティ関数 | `src/utils/__tests__/` | `[ファイル名].test.ts` | Jest |
| UIコンポーネント | `src/components/__tests__/` | `[コンポーネント名].test.tsx` | Jest + RTL |
| フック | `src/hooks/__tests__/` | `[フック名].test.ts(x)` | Jest |
| APIクライアント | `src/lib/api/__tests__/` | `[APIクライアント名].test.ts` | Jest |
| モデル | `src/models/__tests__/` | `[モデル名].test.ts` | Jest |
| 統合テスト | `src/app/__tests__/` | `[機能名].test.ts(x)` | Jest + RTL |
| E2Eテスト | `src/app/__tests__/` | `[機能名].e2e.test.ts` | Playwright |
| 結合テスト | `cypress/e2e/` | `[機能名].cy.ts` | Cypress |

### 設定ファイル

| ファイル | 場所 | 役割 |
|---------|------|------|
| Jest設定 | `/jest.config.js` | Jestの主要設定（テストパターン、モック、カバレッジなど） |
| Jestセットアップ | `/jest.setup.js` | Jest実行前の追加設定（カスタムマッチャーなど） |
| テスト環境設定 | `/src/setupTests.ts` | テスト環境のグローバル設定（モック、環境変数など） |
| Playwright設定 | `/playwright.config.ts` | E2Eテスト用のPlaywright設定 |
| Cypress設定 | `/cypress.config.ts` | 結合テスト用のCypress設定 |
| TypeScript設定 | `/tsconfig.jest.json` | テスト用のTypeScript設定 |
| テスト固有のTS設定 | `/src/tsconfig.json` | src内のテスト専用TypeScript設定 |

### ドキュメント

| ドキュメント | 場所 | 内容 |
|-------------|------|------|
| テスト標準化ガイド | `/docs/test-standards.md` | テスト作成の標準ルール |
| 型定義ガイド | `/src/types/README.md` | 型定義関連のガイドライン |
| **このファイル** | `/docs/test-guide.md` | テスト関連情報の総合ガイド |

## テスト標準化ルール

### テストの種類と配置

1. **ユニットテスト**
   - 個々の関数、メソッド、コンポーネントの機能テスト
   - Jest + React Testing Libraryを使用
   - 適切なディレクトリに配置（上記表参照）

2. **統合テスト**
   - 複数のコンポーネントやモジュール間の連携テスト
   - Jest + React Testing Libraryを使用
   - `src/app/__tests__/`に配置

3. **E2Eテスト**
   - エンドツーエンドでのユーザーフロー
   - **Playwrightを使用**
   - 完全なユーザージャーニーをテスト
   - `src/app/__tests__/`に配置し、ファイル名は`.e2e.test.ts`で終わる
   - 複数ブラウザでの並行テストに最適

4. **結合テスト**
   - コンポーネント間の相互作用
   - **Cypressを使用**
   - ブラウザベースのユーザーインターフェース検証
   - `cypress/e2e/`ディレクトリに配置
   - ファイル名は`.cy.ts`で終わる
   - インタラクティブなデバッグに最適

### テスト重複の防止

- 新しいテスト作成前に既存テストを確認
- 同種のテストは1つのファイルに統合
- 異なる種類のテストは分離
- 統合時は`describe`ブロックで区分け

### 命名規則の統一

- **ファイル命名**: 単数形/複数形の統一（例: `PointsSystem`）
- **テスト内の命名**:
  - `describe`: テスト対象の機能やコンポーネント名
  - `it/test`: 具体的なテストケースを説明する文（日本語可）

### プロジェクト固有の注意点

1. **ギバースコア関連テスト**:
   - `GiverScoreCalculator`の実装は`src/utils/__tests__/`に統合済み
   - ポイントとギバースコアの違いを明確に区別

2. **ポイントシステムテスト**:
   - 名称は`PointsSystem`に統一（末尾の's'に注意）
   - モック/実際のAPIテストを明確に区別

3. **UIコンポーネントテスト**:
   - 必ず`src/components/__tests__/`に配置
   - スナップショットテストとインタラクションテストを併用

## テスト実行方法

### 基本的な実行コマンド（Jest）

```bash
# 全テスト実行
npm test

# 特定のテストファイル実行
npm test -- path/to/test/file.test.ts

# ファイル名パターンでテスト実行
npm test -- -t "GiverScore"

# 監視モードでテスト実行
npm run test:watch

# カバレッジレポート生成
npm test -- --coverage
```

### E2Eテスト実行（Playwright）

```bash
# すべてのE2Eテスト実行
npm run test:playwright

# モックを使用したE2Eテスト
npm run test:e2e:mock

# 実ユーザー操作のE2Eテスト
npm run test:e2e:user

# ブラウザを表示してE2Eテスト実行
npm run test:e2e:headed

# UIモードでPlaywrightテスト実行
npm run test:e2e:ui

# Playwrightレポート表示
npm run playwright:report
```

### 結合テスト実行（Cypress）

```bash
# Cypressテスト実行（ヘッドレス）
npm run cypress:run

# Cypressテスト実行（ブラウザ表示）
npm run cypress:open

# 結合テスト実行のショートカット
npm run test:e2e
```

## テスト設定ファイル

### Jest設定（jest.config.js）

Jestの主要設定は`jest.config.js`で行います：

```javascript
// 主な設定項目
const customJestConfig = {
  // テスト環境
  testEnvironment: 'jsdom',
  
  // テストのマッチパターン
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  
  // モジュール名マッピング
  moduleNameMapper: {
    '@/(.*)$': '<rootDir>/src/$1',
    // ...
  },
  
  // テスト前の設定ファイル
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/src/setupTests.ts'
  ],
  
  // カバレッジの設定
  collectCoverageFrom: [ /* ... */ ],
  
  // タイムアウト設定
  testTimeout: 30000,
  
  // ts-jestの設定
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.jest.json',
      isolatedModules: true,
      // ...
    },
  },
  // ...
};
```

### Playwright設定（playwright.config.ts）

Playwrightの設定は`playwright.config.ts`で行います：

```typescript
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  // テストディレクトリ
  testDir: './src/app/__tests__',
  
  // タイムアウト設定
  timeout: 60000,
  
  // ブラウザ設定
  projects: [
    { name: 'Chrome', use: { browserName: 'chromium' } },
    { name: 'Firefox', use: { browserName: 'firefox' } },
    { name: 'WebKit', use: { browserName: 'webkit' } },
  ],
  
  // テストマッチパターン（E2Eテストのみ）
  testMatch: '**/*.e2e.test.ts',
  
  // ...その他の設定
};
```

### Cypress設定（cypress.config.ts）

Cypressの設定は`cypress.config.ts`で行います：

```typescript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    // 結合テスト用の設定
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    // ...その他の設定
  },
});
```

### テスト環境設定（setupTests.ts）

グローバルモックや環境変数の設定は`src/setupTests.ts`で行います：

```typescript
// グローバルなモックの設定
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// 環境変数設定
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// ブラウザAPIのモック設定
class MockMutationObserver { /* ... */ }
global.MutationObserver = MockMutationObserver as unknown as typeof MutationObserver;

// IntersectionObserverのモック
class MockIntersectionObserver { /* ... */ }
global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

// ResizeObserverのモック
class MockResizeObserver { /* ... */ }
global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

// テスト後のクリーンアップ
afterEach(() => {
  jest.clearAllMocks();
});
```

### Jestセットアップ（jest.setup.js）

Jestのカスタムマッチャーなどの設定は`jest.setup.js`で行います：

```javascript
// Jest-DOMの拡張機能を読み込み
import '@testing-library/jest-dom';

// タイムアウト設定
jest.setTimeout(30000);

// カスタムマッチャー
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    // ...
  }
});
```

## TypeScript型定義

### 型定義ファイル

テスト関連の型定義は以下のファイルで管理されています：

1. **jest.d.ts** - Jestの型拡張
   - マッチャー関数（`toBeInTheDocument`など）
   - グローバル関数（`jest.fn()`など）
   - モック関数・オブジェクト

2. **test-utils.d.ts** - テストユーティリティの型定義
   - カスタムマッチャー
   - React Testing Libraryの型拡張

### 型エラーの解決方法

テストでTypeScriptの型エラーが発生した場合の対処法：

1. **マッチャー関連のエラー**
   - `jest.d.ts`の`Matchers<R>`インターフェースを確認
   - 必要なマッチャーを追加

2. **モック関連のエラー**
   - `jest.d.ts`の`MockInstance`インターフェースを確認
   - モック関数の型定義を修正

3. **グローバル関数関連のエラー**
   - tsconfig.jsonの`types`配列に`"jest"`が含まれているか確認

4. **フェッチ関連のエラー**
   - グローバルなfetch関数のモック型定義を確認

## テストのトラブルシューティング

### 一般的な問題と解決策

1. **テストが失敗する場合**
   - テスト環境のセットアップを確認（`setupTests.ts`）
   - モックが正しく機能しているか確認
   - 非同期処理の待機が適切か確認

2. **型エラーが発生する場合**
   - 適切な型定義ファイルを確認・修正（`jest.d.ts`, `test-utils.d.ts`）
   - tsconfig.jsonの設定を確認

3. **テストが見つからない場合**
   - テストパターン（`jest.config.js`の`testMatch`）を確認
   - ファイル名が規約に従っているか確認

4. **テストが遅い場合**
   - テストの独立性を確保（テスト間の依存を排除）
   - モックを適切に使用して外部依存を減らす

### E2EテストとCypressテストの違い

E2Eテスト(Playwright)と結合テスト(Cypress)は異なる目的で使用します：

1. **E2Eテスト（Playwright）**
   - 完全なエンドツーエンドのユーザーフローをテスト
   - 複数のブラウザでの並行テストに最適
   - ヘッドレステストに強い
   - パフォーマンス測定に適している
   - ページ間の移動や複雑なフローを含むテストに最適

2. **結合テスト（Cypress）**
   - コンポーネント間の相互作用に焦点
   - より視覚的なデバッグ体験
   - インタラクティブなUI要素のテストに優れている
   - リアルタイムリロードによる開発者体験の向上
   - 特定のUIフローの検証に最適

### 特定の問題と解決策

1. **ReactコンポーネントテストでのDOMエラー**
   - React Testing Libraryの適切な使用を確認
   - `cleanup`が各テスト後に実行されているか確認

2. **非同期テストのタイムアウト**
   - `jest.setTimeout()`でタイムアウト時間を調整
   - 非同期処理の適切な待機を確認

3. **スナップショットテストの失敗**
   - 意図的な変更の場合は`-u`フラグでスナップショットを更新
   - UIコンポーネントの変更を確認

4. **Playwrightテストの失敗**
   - `playwright.config.ts`の設定を確認
   - タイムアウト値の調整
   - レポートを確認して問題を特定（`npm run playwright:report`）

5. **Cypressテストの失敗**
   - Cypressのインタラクティブモードで問題を確認（`npm run cypress:open`）
   - 要素セレクタを確認
   - 適切な待機条件を設定

## 参照ドキュメント

詳細な情報については、以下のドキュメントを参照してください：

1. [テスト標準化ガイドライン](/docs/test-standards.md) - テスト作成の標準ルール
2. [型定義ガイド](/src/types/README.md) - 型定義関連のガイドライン
3. [Jest公式ドキュメント](https://jestjs.io/docs/getting-started) - Jestの詳細ガイド
4. [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) - RTLの使用方法
5. [Playwright公式ドキュメント](https://playwright.dev/docs/intro) - E2Eテストフレームワーク
6. [Cypress公式ドキュメント](https://docs.cypress.io/guides/overview/why-cypress) - 結合テストフレームワーク

---

このガイドは継続的に更新されます。質問や提案がある場合は、プロジェクト管理者にお問い合わせください。 