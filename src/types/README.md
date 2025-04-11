# ShiftWithプロジェクト 型定義ディレクトリ

このディレクトリにはプロジェクト全体で使用される型定義ファイルが含まれています。特に以下の種類の型定義があります：

1. ドメインモデル関連の型定義 (activity.ts, badges.ts など)
2. テスト関連の型定義 (jest.d.ts, test-utils.d.ts)
3. 外部ライブラリの型拡張 (supabase.d.ts など)

## テスト関連の型定義

`jest.d.ts` と `test-utils.d.ts` は特にJestテストでの型チェックに重要なファイルです。これらは以下の機能を提供します：

### jest.d.ts

- Jestのグローバル関数（expect, jest.fn()など）の型定義
- テストマッチャー（toBeInTheDocument, toHaveAttributeなど）の型定義
- モック関数・オブジェクトの型定義
- グローバルなfetch関数のモック型定義

```typescript
// 例：カスタムマッチャーの型定義
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveAttribute(attr: string, value?: string): R;
      // 他のマッチャー...
    }
  }
}
```

### test-utils.d.ts

- テスト固有のユーティリティ関数や拡張マッチャーの型定義
- React Testing Libraryの型拡張

```typescript
// 例：カスタムテストユーティリティの型定義
interface CustomMatchers<R = unknown> {
  toBeWithinRange(floor: number, ceiling: number): R;
}

declare global {
  namespace jest {
    interface Matchers<R> extends CustomMatchers<R> {}
  }
}
```

## 型エラーの解決方法

テスト実行時に型エラーが発生した場合の対処法：

1. **マッチャー関連の型エラー**（例: `Property 'toBeInTheDocument' does not exist on type...`）
   - `jest.d.ts` の `Matchers<R>` インターフェースに該当するマッチャーを追加

2. **モック関連の型エラー**（例: `Property 'mockResolvedValue' does not exist on type...`）
   - `jest.d.ts` の `MockInstance` インターフェースを確認・修正

3. **グローバル関数関連の型エラー**（例: `Cannot find name 'jest'`）
   - プロジェクト設定でJestの型をインポートしているか確認
   - `tsconfig.json` の `types` 配列に `"jest"` が含まれているか確認

4. **カスタムユーティリティの型エラー**
   - `test-utils.d.ts` にカスタム型を追加

## 型定義ファイルの更新方法

型定義ファイルを更新する場合は、以下の点に注意してください：

1. 既存の型定義を尊重し、互換性を維持する
2. 型定義の重複を避ける
3. `declare global` ブロック内で適切な名前空間を使用する
4. 変更後にテストを実行して型エラーが解消されたことを確認

## TypeScriptのバージョン互換性

現在のプロジェクトではTypeScript 5.x系を使用しています。型定義ファイルは以下のTypeScript機能を活用しています：

- 条件付き型（Conditional Types）
- 名前空間拡張（Namespace Augmentation）
- インタフェース拡張（Interface Extension）
- 型アサーション（Type Assertion）

これらの機能はTypeScript 4.x以降で安定しています。 