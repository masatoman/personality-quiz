import { getPersonalityDescription } from '../personality';
import { PersonalityType } from '@/types/quiz';

describe('personality utils', () => {
  describe('getPersonalityDescription', () => {
    test('Giverタイプの説明を正しく返す', () => {
      const description = getPersonalityDescription('giver');
      
      expect(description.title).toBe('共感型学習者');
      expect(description.description).toContain('他者との関わりを通じて学ぶ');
      expect(description.strengths).toHaveLength(4);
      expect(description.weaknesses).toHaveLength(3);
      expect(description.learningAdvice.tips).toHaveLength(4);
      expect(description.learningAdvice.tools).toHaveLength(4);
    });

    test('Takerタイプの説明を正しく返す', () => {
      const description = getPersonalityDescription('taker');
      
      expect(description.title).toBe('没入型学習者');
      expect(description.description).toContain('深い集中状態で学ぶ');
      expect(description.strengths).toHaveLength(4);
      expect(description.weaknesses).toHaveLength(3);
      expect(description.learningAdvice.tips).toHaveLength(4);
      expect(description.learningAdvice.tools).toHaveLength(4);
    });

    test('Matcherタイプの説明を正しく返す', () => {
      const description = getPersonalityDescription('matcher');
      
      expect(description.title).toBe('適応型学習者');
      expect(description.description).toContain('状況に応じて最適な学習方法');
      expect(description.strengths).toHaveLength(4);
      expect(description.weaknesses).toHaveLength(3);
      expect(description.learningAdvice.tips).toHaveLength(4);
      expect(description.learningAdvice.tools).toHaveLength(4);
    });

    test('すべてのタイプで必要な属性が存在する', () => {
      const types: PersonalityType[] = ['giver', 'taker', 'matcher'];
      
      types.forEach(type => {
        const description = getPersonalityDescription(type);
        
        expect(description.title).toBeTruthy();
        expect(description.description).toBeTruthy();
        expect(Array.isArray(description.strengths)).toBe(true);
        expect(Array.isArray(description.weaknesses)).toBe(true);
        expect(description.learningAdvice.title).toBeTruthy();
        expect(Array.isArray(description.learningAdvice.tips)).toBe(true);
        expect(Array.isArray(description.learningAdvice.tools)).toBe(true);
      });
    });
  });
}); 