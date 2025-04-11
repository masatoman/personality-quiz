import { validateMaterial, Material, MaterialStatus } from '../MaterialModel';

describe('MaterialModel バリデーション', () => {
  describe('validateMaterial', () => {
    it('有効な教材データを検証できる', () => {
      const validMaterial: Material = {
        id: 'material-123',
        title: '初級英語文法講座',
        description: '英語の基本文法をわかりやすく解説します',
        content: '<p>これは教材のコンテンツです</p>',
        authorId: 'user-456',
        status: MaterialStatus.PUBLISHED,
        category: 'grammar',
        level: 'beginner',
        tags: ['英文法', '初級'],
        estimatedTime: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        sections: [
          {
            id: 'section-1',
            title: 'セクション1',
            content: '<p>セクション1のコンテンツ</p>',
            order: 1
          }
        ],
        coverImageUrl: 'https://example.com/image.jpg'
      };
      
      const result = validateMaterial(validMaterial);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
    
    it('タイトルが空の場合にエラーを検出する', () => {
      const invalidMaterial: Material = {
        id: 'material-123',
        title: '',
        description: '英語の基本文法をわかりやすく解説します',
        content: '<p>これは教材のコンテンツです</p>',
        authorId: 'user-456',
        status: MaterialStatus.PUBLISHED,
        category: 'grammar',
        level: 'beginner',
        tags: ['英文法', '初級'],
        estimatedTime: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        sections: [
          {
            id: 'section-1',
            title: 'セクション1',
            content: '<p>セクション1のコンテンツ</p>',
            order: 1
          }
        ],
        coverImageUrl: 'https://example.com/image.jpg'
      };
      
      const result = validateMaterial(invalidMaterial);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('タイトルは必須です');
    });
    
    it('タイトルが長すぎる場合にエラーを検出する', () => {
      const invalidMaterial: Material = {
        id: 'material-123',
        title: '非常に長いタイトル'.repeat(20), // 200文字以上
        description: '英語の基本文法をわかりやすく解説します',
        content: '<p>これは教材のコンテンツです</p>',
        authorId: 'user-456',
        status: MaterialStatus.PUBLISHED,
        category: 'grammar',
        level: 'beginner',
        tags: ['英文法', '初級'],
        estimatedTime: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        sections: [
          {
            id: 'section-1',
            title: 'セクション1',
            content: '<p>セクション1のコンテンツ</p>',
            order: 1
          }
        ],
        coverImageUrl: 'https://example.com/image.jpg'
      };
      
      const result = validateMaterial(invalidMaterial);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('タイトルは100文字以内で入力してください');
    });
    
    it('説明文が長すぎる場合にエラーを検出する', () => {
      const invalidMaterial: Material = {
        id: 'material-123',
        title: '初級英語文法講座',
        description: '長い説明文'.repeat(100), // 500文字以上
        content: '<p>これは教材のコンテンツです</p>',
        authorId: 'user-456',
        status: MaterialStatus.PUBLISHED,
        category: 'grammar',
        level: 'beginner',
        tags: ['英文法', '初級'],
        estimatedTime: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        sections: [
          {
            id: 'section-1',
            title: 'セクション1',
            content: '<p>セクション1のコンテンツ</p>',
            order: 1
          }
        ],
        coverImageUrl: 'https://example.com/image.jpg'
      };
      
      const result = validateMaterial(invalidMaterial);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('説明文は300文字以内で入力してください');
    });
    
    it('コンテンツが空の場合にエラーを検出する', () => {
      const invalidMaterial: Material = {
        id: 'material-123',
        title: '初級英語文法講座',
        description: '英語の基本文法をわかりやすく解説します',
        content: '',
        authorId: 'user-456',
        status: MaterialStatus.PUBLISHED,
        category: 'grammar',
        level: 'beginner',
        tags: ['英文法', '初級'],
        estimatedTime: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        sections: [],
        coverImageUrl: 'https://example.com/image.jpg'
      };
      
      const result = validateMaterial(invalidMaterial);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('コンテンツは必須です');
    });
    
    it('セクションの順序が重複している場合にエラーを検出する', () => {
      const invalidMaterial: Material = {
        id: 'material-123',
        title: '初級英語文法講座',
        description: '英語の基本文法をわかりやすく解説します',
        content: '<p>これは教材のコンテンツです</p>',
        authorId: 'user-456',
        status: MaterialStatus.PUBLISHED,
        category: 'grammar',
        level: 'beginner',
        tags: ['英文法', '初級'],
        estimatedTime: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        sections: [
          {
            id: 'section-1',
            title: 'セクション1',
            content: '<p>セクション1のコンテンツ</p>',
            order: 1
          },
          {
            id: 'section-2',
            title: 'セクション2',
            content: '<p>セクション2のコンテンツ</p>',
            order: 1 // 重複する順序
          }
        ],
        coverImageUrl: 'https://example.com/image.jpg'
      };
      
      const result = validateMaterial(invalidMaterial);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('セクションの順序が重複しています');
    });
    
    it('タグが多すぎる場合にエラーを検出する', () => {
      const invalidMaterial: Material = {
        id: 'material-123',
        title: '初級英語文法講座',
        description: '英語の基本文法をわかりやすく解説します',
        content: '<p>これは教材のコンテンツです</p>',
        authorId: 'user-456',
        status: MaterialStatus.PUBLISHED,
        category: 'grammar',
        level: 'beginner',
        tags: ['タグ1', 'タグ2', 'タグ3', 'タグ4', 'タグ5', 'タグ6', 'タグ7', 'タグ8', 'タグ9', 'タグ10', 'タグ11'],
        estimatedTime: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        sections: [
          {
            id: 'section-1',
            title: 'セクション1',
            content: '<p>セクション1のコンテンツ</p>',
            order: 1
          }
        ],
        coverImageUrl: 'https://example.com/image.jpg'
      };
      
      const result = validateMaterial(invalidMaterial);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('タグは10個以内で設定してください');
    });
    
    it('公開ステータスなのに公開日がない場合にエラーを検出する', () => {
      const invalidMaterial: Material = {
        id: 'material-123',
        title: '初級英語文法講座',
        description: '英語の基本文法をわかりやすく解説します',
        content: '<p>これは教材のコンテンツです</p>',
        authorId: 'user-456',
        status: MaterialStatus.PUBLISHED,
        category: 'grammar',
        level: 'beginner',
        tags: ['英文法', '初級'],
        estimatedTime: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: undefined, // 公開日なし
        sections: [
          {
            id: 'section-1',
            title: 'セクション1',
            content: '<p>セクション1のコンテンツ</p>',
            order: 1
          }
        ],
        coverImageUrl: 'https://example.com/image.jpg'
      };
      
      const result = validateMaterial(invalidMaterial);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('公開ステータスの教材には公開日が必要です');
    });
  });
}); 