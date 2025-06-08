export enum MaterialStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export interface MaterialSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface Material {
  id: string;
  title: string;
  description: string;
  content: string;
  authorId: string;
  status: MaterialStatus;
  category: string;
  level: string;
  tags: string[];
  estimatedTime: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  sections: MaterialSection[];
  coverImageUrl?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateMaterial(material: Material): ValidationResult {
  const errors: string[] = [];

  // タイトルの検証
  if (!material.title || material.title.trim() === '') {
    errors.push('タイトルは必須です');
  } else if (material.title.length > 100) {
    errors.push('タイトルは100文字以内で入力してください');
  }

  // 説明文の検証
  if (material.description && material.description.length > 300) {
    errors.push('説明文は300文字以内で入力してください');
  }

  // コンテンツの検証
  if (!material.content || material.content.trim() === '') {
    if (!material.sections || material.sections.length === 0) {
      errors.push('コンテンツは必須です');
    }
  }

  // セクションの順序重複チェック
  if (material.sections && material.sections.length > 1) {
    const orders = material.sections.map(section => section.order);
    const uniqueOrders = new Set(orders);
    if (orders.length !== uniqueOrders.size) {
      errors.push('セクションの順序が重複しています');
    }
  }

  // タグ数の検証
  if (material.tags && material.tags.length > 10) {
    errors.push('タグは10個以内で設定してください');
  }

  // 予想学習時間の検証
  if (material.estimatedTime < 0) {
    errors.push('予想学習時間は0分以上で設定してください');
  } else if (material.estimatedTime > 1440) {
    errors.push('予想学習時間は1440分（24時間）以内で設定してください');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
} 