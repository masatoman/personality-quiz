import { getPersonalityDescription } from '../personality';
import { PersonalityType } from '@/types/quiz';

describe('Personality utilities', () => {
  describe('getPersonalityDescription', () => {
    test('giverタイプの説明を正しく取得する', () => {
      const result = getPersonalityDescription('giver');
      
      // 基本構造の検証
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('strengths');
      expect(result).toHaveProperty('weaknesses');
      expect(result).toHaveProperty('learningAdvice');
      
      // giverタイプ固有の内容を検証
      expect(result.title).toBe('共感型学習者');
      expect(result.strengths).toHaveLength(4);
      expect(result.weaknesses).toHaveLength(3);
      expect(result.learningAdvice.tips).toHaveLength(4);
      expect(result.learningAdvice.tools).toHaveLength(4);
    });
    
    test('takerタイプの説明を正しく取得する', () => {
      const result = getPersonalityDescription('taker');
      
      // 基本構造の検証
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('strengths');
      expect(result).toHaveProperty('weaknesses');
      expect(result).toHaveProperty('learningAdvice');
      
      // takerタイプ固有の内容を検証
      expect(result.title).toBe('没入型学習者');
      expect(result.strengths).toHaveLength(4);
      expect(result.weaknesses).toHaveLength(3);
      expect(result.learningAdvice.tips).toHaveLength(4);
      expect(result.learningAdvice.tools).toHaveLength(4);
    });
    
    test('matcherタイプの説明を正しく取得する', () => {
      const result = getPersonalityDescription('matcher');
      
      // 基本構造の検証
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('strengths');
      expect(result).toHaveProperty('weaknesses');
      expect(result).toHaveProperty('learningAdvice');
      
      // matcherタイプ固有の内容を検証
      expect(result.title).toBe('適応型学習者');
      expect(result.strengths).toHaveLength(4);
      expect(result.weaknesses).toHaveLength(3);
      expect(result.learningAdvice.tips).toHaveLength(4);
      expect(result.learningAdvice.tools).toHaveLength(4);
    });
    
    test('各タイプの説明は一意である', () => {
      const giverDesc = getPersonalityDescription('giver');
      const takerDesc = getPersonalityDescription('taker');
      const matcherDesc = getPersonalityDescription('matcher');
      
      // タイトルが重複していないことを確認
      expect(giverDesc.title).not.toBe(takerDesc.title);
      expect(giverDesc.title).not.toBe(matcherDesc.title);
      expect(takerDesc.title).not.toBe(matcherDesc.title);
      
      // 説明が重複していないことを確認
      expect(giverDesc.description).not.toBe(takerDesc.description);
      expect(giverDesc.description).not.toBe(matcherDesc.description);
      expect(takerDesc.description).not.toBe(matcherDesc.description);
    });
  });
}); 