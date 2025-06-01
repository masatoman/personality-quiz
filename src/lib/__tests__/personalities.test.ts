/**
 * パーソナリティ関数テスト
 * src/lib/personalities.ts の getPersonalityDescription 関数をテスト
 */

import { getPersonalityDescription } from '../personalities';
import { PersonalityType } from '@/types/quiz';

describe('getPersonalityDescription関数', () => {
  test('giver型の説明を正しく返す', () => {
    const result = getPersonalityDescription('giver');
    
    expect(result.title).toBe('ギバー型');
    expect(result.description).toContain('ギバー型です');
    expect(result.description).toContain('知識を共有し');
    expect(result.strengths).toHaveLength(5);
    expect(result.weaknesses).toHaveLength(5);
    expect(result.learningAdvice.title).toBe('効果的な学習アドバイス');
    expect(result.learningAdvice.tips).toHaveLength(5);
    expect(result.learningAdvice.tools).toHaveLength(5);
  });

  test('matcher型の説明を正しく返す', () => {
    const result = getPersonalityDescription('matcher');
    
    expect(result.title).toBe('マッチャー型');
    expect(result.description).toContain('マッチャー型です');
    expect(result.description).toContain('バランス感覚');
    expect(result.strengths).toHaveLength(5);
    expect(result.weaknesses).toHaveLength(5);
    expect(result.learningAdvice.title).toBe('効果的な学習アドバイス');
    expect(result.learningAdvice.tips).toHaveLength(5);
    expect(result.learningAdvice.tools).toHaveLength(5);
  });

  test('taker型の説明を正しく返す', () => {
    const result = getPersonalityDescription('taker');
    
    expect(result.title).toBe('テイカー型');
    expect(result.description).toContain('テイカー型です');
    expect(result.description).toContain('自己主導型');
    expect(result.strengths).toHaveLength(5);
    expect(result.weaknesses).toHaveLength(5);
    expect(result.learningAdvice.title).toBe('効果的な学習アドバイス');
    expect(result.learningAdvice.tips).toHaveLength(5);
    expect(result.learningAdvice.tools).toHaveLength(5);
  });

  test('無効な型の場合はmatcher型をデフォルトで返す', () => {
    const result = getPersonalityDescription('invalid-type');
    
    expect(result.title).toBe('マッチャー型');
    expect(result.description).toContain('マッチャー型です');
  });

  test('空文字列の場合はmatcher型をデフォルトで返す', () => {
    const result = getPersonalityDescription('');
    
    expect(result.title).toBe('マッチャー型');
    expect(result.description).toContain('マッチャー型です');
  });

  test('各パーソナリティ型の学習アドバイスが適切に設定されている', () => {
    const types: PersonalityType[] = ['giver', 'matcher', 'taker'];
    
    types.forEach(type => {
      const result = getPersonalityDescription(type);
      
      // 学習アドバイスの構造をチェック
      expect(result.learningAdvice).toHaveProperty('title');
      expect(result.learningAdvice).toHaveProperty('tips');
      expect(result.learningAdvice).toHaveProperty('tools');
      
      // 配列の長さをチェック
      expect(result.learningAdvice.tips.length).toBeGreaterThan(0);
      expect(result.learningAdvice.tools.length).toBeGreaterThan(0);
      
      // 各要素が文字列であることをチェック
      result.learningAdvice.tips.forEach(tip => {
        expect(typeof tip).toBe('string');
        expect(tip.length).toBeGreaterThan(0);
      });
      
      result.learningAdvice.tools.forEach(tool => {
        expect(typeof tool).toBe('string');
        expect(tool.length).toBeGreaterThan(0);
      });
    });
  });

  test('各パーソナリティ型の強みと弱みが適切に設定されている', () => {
    const types: PersonalityType[] = ['giver', 'matcher', 'taker'];
    
    types.forEach(type => {
      const result = getPersonalityDescription(type);
      
      // 強みの検証
      expect(result.strengths.length).toBeGreaterThan(0);
      result.strengths.forEach(strength => {
        expect(typeof strength).toBe('string');
        expect(strength.length).toBeGreaterThan(0);
      });
      
      // 弱みの検証
      expect(result.weaknesses.length).toBeGreaterThan(0);
      result.weaknesses.forEach(weakness => {
        expect(typeof weakness).toBe('string');
        expect(weakness.length).toBeGreaterThan(0);
      });
    });
  });

  test('giver型の特徴的な内容が含まれている', () => {
    const result = getPersonalityDescription('giver');
    
    // ギバー型特有のキーワードをチェック（実際の文言に合わせて修正）
    expect(result.description).toContain('知識を共有し');
    expect(result.description).toContain('他者をサポート');
    expect(result.strengths.some(s => s.includes('教える'))).toBe(true);
    expect(result.learningAdvice.tips.some(t => t.includes('言語交換'))).toBe(true);
  });

  test('matcher型の特徴的な内容が含まれている', () => {
    const result = getPersonalityDescription('matcher');
    
    // マッチャー型特有のキーワードをチェック
    expect(result.description).toContain('バランス');
    expect(result.strengths.some(s => s.includes('バランス'))).toBe(true);
    expect(result.learningAdvice.tips.some(t => t.includes('バランス'))).toBe(true);
  });

  test('taker型の特徴的な内容が含まれている', () => {
    const result = getPersonalityDescription('taker');
    
    // テイカー型特有のキーワードをチェック
    expect(result.description).toContain('自己主導型');
    expect(result.strengths.some(s => s.includes('自己主導型'))).toBe(true);
    expect(result.learningAdvice.tips.some(t => t.includes('目標'))).toBe(true);
  });
}); 