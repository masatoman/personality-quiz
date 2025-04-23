/**
 * E2Eテストのグループ設定
 */

export const TEST_GROUPS = {
  SMOKE: 'smoke',      // 基本的な機能テスト
  CRITICAL: 'critical', // 重要な機能テスト
  REGRESSION: 'regression', // リグレッションテスト
  PERFORMANCE: 'performance', // パフォーマンステスト
} as const;

export type TestGroup = typeof TEST_GROUPS[keyof typeof TEST_GROUPS];

/**
 * テストの優先度設定
 */
export const TEST_PRIORITIES = {
  P0: 'p0', // 最重要（ブロッカー）
  P1: 'p1', // 重要（主要機能）
  P2: 'p2', // 中程度（二次機能）
  P3: 'p3', // 低（マイナー機能）
} as const;

export type TestPriority = typeof TEST_PRIORITIES[keyof typeof TEST_PRIORITIES];

/**
 * テストケースのメタデータ型定義
 */
export interface TestMetadata {
  group: TestGroup;
  priority: TestPriority;
  description: string;
  requirements?: string[];
  dependencies?: string[];
}

/**
 * テストケースにメタデータを付与するデコレータ
 */
export function TestCase(metadata: TestMetadata): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      console.log(`🧪 実行中のテスト: ${metadata.description}`);
      console.log(`📋 グループ: ${metadata.group}`);
      console.log(`🎯 優先度: ${metadata.priority}`);
      return await originalMethod.apply(this, args);
    };
    return descriptor;
  };
} 