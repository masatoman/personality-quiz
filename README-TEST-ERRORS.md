# テストエラー解決ガイド

## 発生している主な問題点

1. **Jest型定義問題**: 
   - `toBe()`, `toEqual()`, `toHaveBeenCalled()`などのアサーションメソッドの型が認識されていない
   - 解決策：`src/types/jest.d.ts`を作成し、Jest型定義を追加

2. **依存関係の互換性問題**:
   - `@testing-library/react-hooks`がReact 18と互換性がない
   - 解決策：`@testing-library/react`の最新版を使用し、テストコードを更新

3. **Supabaseモックの問題**:
   - モック関数の型定義が正しくない
   - 解決策：`src/types/supabase.d.ts`を作成し、モック用の型定義を追加

## 具体的な修正方法

### 1. Jest型定義の修正

`src/types/jest.d.ts`ファイルが正しく作成されていることを確認してください。ファイル内に以下の定義が必要です：

```typescript
import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveTextContent(text: string | RegExp): R;
      toBeVisible(): R;
      toHaveClass(className: string): R;
      toHaveProperty(keyPath: string, value?: any): R;
      toHaveLength(length: number): R;
      toHaveBeenCalledWith(...args: any[]): R;
      toHaveBeenCalled(): R;
      toBe(expected: any): R;
      toEqual(expected: any): R;
      toBeDefined(): R;
      toBeNull(): R;
      toBeInstanceOf(expected: any): R;
      toBeGreaterThan(expected: number): R;
      toContain(expected: any): R;
    }
  }

  interface ExpectStatic {
    objectContaining(expected: any): any;
    arrayContaining(expected: any[]): any;
    any(constructor: any): any;
  }
}

export {};
```

### 2. useAuth.hookのインターフェース修正

`src/hooks/useAuth.tsx`を確認し、`signUp`と`signIn`メソッドのシグネチャが以下のような形式になっているか確認：

```typescript
signUp: (credentials: { email: string; password: string }) => Promise<...>
signIn: (credentials: { email: string; password: string }) => Promise<...>
```

または、テストコードを修正して現在のシグネチャに合わせる：

```typescript
signUpResult = await result.current.signUp('test@example.com', 'password123');
signInResult = await result.current.signIn('test@example.com', 'password123');
```

### 3. Supabaseモックの修正

`src/types/supabase.d.ts`を以下のように更新：

```typescript
import { SupabaseClient } from '@supabase/supabase-js';

declare module '@/lib/supabase' {
  const supabase: SupabaseClient & {
    from: jest.Mock;
    select: jest.Mock;
    eq: jest.Mock;
    order: jest.Mock;
    insert: jest.Mock;
    single: jest.Mock;
    limit: jest.Mock;
  };
  
  export default supabase;
}
```

### 4. データベース関連エラーの修正

`src/types/database.ts`が存在しない場合は以下のように作成：

```typescript
export type Database = {
  public: {
    Tables: {
      [key: string]: any;
    };
    Views: {
      [key: string]: any;
    };
    Functions: {
      [key: string]: any;
    };
  };
};
```

### 5. Playwrightテストの分離

Playwrightテストは別々に実行する必要があります：

```bash
# Jestテストのみ実行
npm test

# Playwrightテストのみ実行
npm run test:playwright
```

## 追加的な注意点

1. `tsconfig.json`の`types`配列に`jest`と`@testing-library/jest-dom`が含まれていることを確認

2. テスト用のセットアップファイル`src/setupTests.ts`が正しく設定されていることを確認

3. モックされていないモジュールが参照されている場合は、適切なモックを作成または既存のファイルを修正

4. 各テストファイルでは、適切な型インポートと型アノテーションを使用する

## テスト実行コマンド

```bash
# 全テスト実行
npm test

# 特定のテストファイルのみ実行
npm test -- src/utils/__tests__/feedback.test.ts

# テストカバレッジレポート生成
npm test -- --coverage
``` 