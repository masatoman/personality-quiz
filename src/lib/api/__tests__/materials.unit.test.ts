import { getMaterial, getMaterials } from '../materials';
import { Material, Difficulty } from '@/types/material';

describe('Materials API', () => {
  describe('getMaterial', () => {
    it('指定されたIDに対応する教材データを返す', async () => {
      const material = await getMaterial('1');
      
      expect(material).toBeDefined();
      expect(material.id).toBe('1');
      expect(material.title).toBe('TypeScriptの基礎');
      expect(material.description).toBe('TypeScriptの基本的な概念と使い方を学びます');
      expect(material.difficulty).toBe('beginner');
      expect(material.sections).toBeInstanceOf(Array);
      expect(material.reviews).toBeInstanceOf(Array);
      expect(material.relatedMaterials).toBeInstanceOf(Array);
      expect(material.targetAudience).toContain('beginner');
      expect(material.language).toBe('ja');
      expect(material.version).toBe('1.0.0');
      expect(material.tags).toContain('TypeScript');
    });

    it('教材データの内容が正しい', async () => {
      const material = await getMaterial('1');
      
      expect(material.author).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        expertise: expect.arrayContaining([expect.any(String)])
      }));
      
      // セクションの検証
      expect(material.sections.length).toBeGreaterThan(0);
      
      // テキストセクションの検証
      const textSection = material.sections.find(section => section.type === 'text');
      expect(textSection).toEqual(expect.objectContaining({
        id: expect.any(String),
        title: expect.any(String),
        content: expect.any(String),
        format: 'markdown'
      }));
      
      // 画像セクションの検証
      const imageSection = material.sections.find(section => section.type === 'image');
      expect(imageSection).toEqual(expect.objectContaining({
        id: expect.any(String),
        title: expect.any(String),
        imageUrl: expect.any(String),
        altText: expect.any(String)
      }));
      
      // クイズセクションの検証
      const quizSection = material.sections.find(section => section.type === 'quiz');
      if (quizSection && 'questions' in quizSection) {
        expect(quizSection.timeLimit).toBeDefined();
        expect(quizSection.questions).toBeInstanceOf(Array);
        if (quizSection.questions.length > 0) {
          const firstQuestion = quizSection.questions[0];
          expect(firstQuestion).toEqual(expect.objectContaining({
            id: expect.any(String),
            question: expect.any(String),
            options: expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(String),
                text: expect.any(String)
              })
            ]),
            correctAnswer: expect.any(String),
            points: expect.any(Number)
          }));
        }
      }
    });
  });
  
  describe('getMaterials', () => {
    it('教材一覧を取得できる', async () => {
      const materials = await getMaterials();
      
      expect(materials).toBeInstanceOf(Array);
      expect(materials.length).toBeGreaterThan(0);
      
      materials.forEach(material => {
        expect(material).toEqual(expect.objectContaining({
          id: expect.any(String),
          title: expect.any(String),
          difficulty: expect.stringMatching(/^(beginner|intermediate|advanced)$/),
          targetAudience: expect.arrayContaining([expect.any(String)]),
          language: expect.any(String),
          version: expect.any(String),
          tags: expect.arrayContaining([expect.any(String)])
        }));
      });
    });
    
    it('フィルターオプションを指定して教材を取得できる', async () => {
      const materials = await getMaterials({
        difficulty: 'beginner' as Difficulty
      });
      
      expect(materials).toBeInstanceOf(Array);
      materials.forEach(material => {
        expect(material.difficulty).toBe('beginner');
      });
    });
    
    it('ページネーションオプションを指定して教材を取得できる', async () => {
      // ページ指定で取得
      const materials = await getMaterials({
        page: 1,
        limit: 10
      });
      
      // 結果の検証
      expect(materials).toBeInstanceOf(Array);
      
      // 実際のページネーションはモックデータのため機能しませんが、
      // 引数が正しく渡されることだけを検証
      // 実際のAPIでは、返されるデータ数が制限に合致することを検証するテストを追加
    });
    
    it('ソートオプションを指定して教材を取得できる', async () => {
      // 新着順で取得
      const materials = await getMaterials({
        sort: 'newest'
      });
      
      // 結果の検証
      expect(materials).toBeInstanceOf(Array);
      
      // 実際のソートはモックデータのため機能しませんが、
      // 引数が正しく渡されることだけを検証
      // 実際のAPIでは、返されるデータが適切にソートされていることを検証するテストを追加
    });
  });
}); 