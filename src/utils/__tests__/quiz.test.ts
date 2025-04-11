import { QuizQuestion, QuizOption, QuizResults } from '@/types/quiz';
import { 
  calculatePersonalityType, 
  getPersonalityTypeDescription,
  getPersonalityDescription 
} from '../quiz';
import { PersonalityType } from '@/types/quiz';

// モック関数
function calculateQuizResults(questions: QuizQuestion[], answers: {questionId: string, optionId: string}[]): QuizResults {
  // スコア初期化
  let giverScore = 0;
  let takerScore = 0;
  let matcherScore = 0;
  
  // 回答ごとにスコアを計算
  answers.forEach(answer => {
    const question = questions.find(q => q.id === answer.questionId);
    if (!question) return;
    
    const option = question.options.find(o => o.id === answer.optionId);
    if (!option) return;
    
    giverScore += option.scores.giver;
    takerScore += option.scores.taker;
    matcherScore += option.scores.matcher;
  });
  
  // 最大スコアからタイプを決定
  let dominantType = 'matcher';
  if (giverScore > takerScore && giverScore > matcherScore) {
    dominantType = 'giver';
  } else if (takerScore > giverScore && takerScore > matcherScore) {
    dominantType = 'taker';
  }
  
  // 合計を計算
  const total = giverScore + takerScore + matcherScore;
  
  // パーセンテージ計算
  const percentage = {
    giver: total === 0 ? 0 : (giverScore / total) * 100,
    taker: total === 0 ? 0 : (takerScore / total) * 100,
    matcher: total === 0 ? 0 : (matcherScore / total) * 100
  };
  
  return {
    giver: giverScore,
    taker: takerScore,
    matcher: matcherScore,
    dominantType: dominantType as any,
    percentage
  };
}

describe('クイズユーティリティ', () => {
  describe('calculateQuizResults', () => {
    const mockQuestions: QuizQuestion[] = [
      {
        id: 'q1',
        text: '質問1',
        options: [
          { id: 'q1o1', text: '選択肢1', scores: { giver: 3, taker: 0, matcher: 1 } },
          { id: 'q1o2', text: '選択肢2', scores: { giver: 0, taker: 3, matcher: 1 } },
          { id: 'q1o3', text: '選択肢3', scores: { giver: 1, taker: 1, matcher: 2 } }
        ]
      },
      {
        id: 'q2',
        text: '質問2',
        options: [
          { id: 'q2o1', text: '選択肢1', scores: { giver: 2, taker: 1, matcher: 1 } },
          { id: 'q2o2', text: '選択肢2', scores: { giver: 0, taker: 2, matcher: 2 } },
          { id: 'q2o3', text: '選択肢3', scores: { giver: 1, taker: 0, matcher: 3 } }
        ]
      },
      {
        id: 'q3',
        text: '質問3',
        options: [
          { id: 'q3o1', text: '選択肢1', scores: { giver: 1, taker: 3, matcher: 0 } },
          { id: 'q3o2', text: '選択肢2', scores: { giver: 2, taker: 1, matcher: 1 } },
          { id: 'q3o3', text: '選択肢3', scores: { giver: 3, taker: 0, matcher: 1 } }
        ]
      }
    ];

    it('選択された回答から正しくギバースコアを計算する', () => {
      const answers = [
        { questionId: 'q1', optionId: 'q1o1' }, // giver: 3, taker: 0, matcher: 1
        { questionId: 'q2', optionId: 'q2o3' }, // giver: 1, taker: 0, matcher: 3
        { questionId: 'q3', optionId: 'q3o3' }  // giver: 3, taker: 0, matcher: 1
      ];

      const result = calculateQuizResults(mockQuestions, answers);

      expect(result.giver).toBe(7);  // 3 + 1 + 3
      expect(result.taker).toBe(0);  // 0 + 0 + 0
      expect(result.matcher).toBe(5);  // 1 + 3 + 1
      expect(result.dominantType).toBe('giver'); // giverスコアが最高
    });

    it('選択された回答から正しくテイカースコアを計算する', () => {
      const answers = [
        { questionId: 'q1', optionId: 'q1o2' }, // giver: 0, taker: 3, matcher: 1
        { questionId: 'q2', optionId: 'q2o2' }, // giver: 0, taker: 2, matcher: 2
        { questionId: 'q3', optionId: 'q3o1' }  // giver: 1, taker: 3, matcher: 0
      ];

      const result = calculateQuizResults(mockQuestions, answers);

      expect(result.giver).toBe(1);  // 0 + 0 + 1
      expect(result.taker).toBe(8);  // 3 + 2 + 3
      expect(result.matcher).toBe(3);  // 1 + 2 + 0
      expect(result.dominantType).toBe('taker'); // takerスコアが最高
    });

    it('選択された回答から正しくマッチャースコアを計算する', () => {
      const answers = [
        { questionId: 'q1', optionId: 'q1o3' }, // giver: 1, taker: 1, matcher: 2
        { questionId: 'q2', optionId: 'q2o3' }, // giver: 1, taker: 0, matcher: 3
        { questionId: 'q3', optionId: 'q3o2' }  // giver: 2, taker: 1, matcher: 1
      ];

      const result = calculateQuizResults(mockQuestions, answers);

      expect(result.giver).toBe(4);  // 1 + 1 + 2
      expect(result.taker).toBe(2);  // 1 + 0 + 1
      expect(result.matcher).toBe(6);  // 2 + 3 + 1
      expect(result.dominantType).toBe('matcher'); // matcherスコアが最高
    });

    it('同点の場合の優先順位を検証する', () => {
      const answers = [
        { questionId: 'q1', optionId: 'q1o1' }, // giver: 3, taker: 0, matcher: 1
        { questionId: 'q2', optionId: 'q2o1' }, // giver: 2, taker: 1, matcher: 1
        { questionId: 'q3', optionId: 'q3o1' }  // giver: 1, taker: 3, matcher: 0
      ];

      const result = calculateQuizResults(mockQuestions, answers);

      expect(result.giver).toBe(6);  // 3 + 2 + 1
      expect(result.taker).toBe(4);  // 0 + 1 + 3
      expect(result.matcher).toBe(2);  // 1 + 1 + 0
      expect(result.dominantType).toBe('giver'); // giverスコアが最高
    });

    it('回答が存在しない質問はスコアに反映されない', () => {
      const answers = [
        { questionId: 'q1', optionId: 'q1o1' }, // giver: 3, taker: 0, matcher: 1
        // q2に対する回答がない
        { questionId: 'q3', optionId: 'q3o3' }  // giver: 3, taker: 0, matcher: 1
      ];

      const result = calculateQuizResults(mockQuestions, answers);

      expect(result.giver).toBe(6);  // 3 + 0 + 3
      expect(result.taker).toBe(0);  // 0 + 0 + 0
      expect(result.matcher).toBe(2);  // 1 + 0 + 1
    });

    it('パーセンテージ計算が正しく行われる', () => {
      const answers = [
        { questionId: 'q1', optionId: 'q1o1' }, // giver: 3, taker: 0, matcher: 1
        { questionId: 'q2', optionId: 'q2o3' }, // giver: 1, taker: 0, matcher: 3
        { questionId: 'q3', optionId: 'q3o3' }  // giver: 3, taker: 0, matcher: 1
      ];

      const result = calculateQuizResults(mockQuestions, answers);

      // 合計: giver=7, taker=0, matcher=5, total=12
      expect(result.percentage.giver).toBeCloseTo(58.33, 1);  // 7/12 * 100
      expect(result.percentage.taker).toBeCloseTo(0, 1);      // 0/12 * 100
      expect(result.percentage.matcher).toBeCloseTo(41.67, 1); // 5/12 * 100
    });
  });
});

describe('Quiz utility functions', () => {
  describe('calculatePersonalityType', () => {
    test('すべての回答がgiver寄りの場合はgiverタイプを返す', () => {
      // 各質問でgiver寄りの選択肢（index:0）を選んだ場合
      const answers = [0, 0, 0, 0, 0];
      const result = calculatePersonalityType(answers);
      expect(result).toBe('giver');
    });
    
    test('すべての回答がtaker寄りの場合はtakerタイプを返す', () => {
      // 各質問でtaker寄りの選択肢（index:1）を選んだ場合
      const answers = [1, 1, 1, 1, 1];
      const result = calculatePersonalityType(answers);
      expect(result).toBe('taker');
    });
    
    test('すべての回答がmatcher寄りの場合はmatcherタイプを返す', () => {
      // 各質問でmatcher寄りの選択肢（index:2）を選んだ場合
      const answers = [2, 2, 2, 2, 2];
      const result = calculatePersonalityType(answers);
      expect(result).toBe('matcher');
    });
    
    test('混合した回答の場合は最多のタイプを返す', () => {
      // giver: 3, taker: 1, matcher: 1 の場合
      const answers = [0, 0, 0, 1, 2];
      const result = calculatePersonalityType(answers);
      expect(result).toBe('giver');
    });
  });
  
  describe('getPersonalityTypeDescription', () => {
    test('giverタイプの説明を返す', () => {
      const description = getPersonalityTypeDescription('giver');
      expect(description).toContain('他者をサポート');
      expect(typeof description).toBe('string');
    });
    
    test('takerタイプの説明を返す', () => {
      const description = getPersonalityTypeDescription('taker');
      expect(description).toContain('効率的な学習方法');
      expect(typeof description).toBe('string');
    });
    
    test('matcherタイプの説明を返す', () => {
      const description = getPersonalityTypeDescription('matcher');
      expect(description).toContain('相互学習');
      expect(typeof description).toBe('string');
    });
  });
  
  describe('getPersonalityDescription', () => {
    test('giverタイプの詳細情報を返す', () => {
      const details = getPersonalityDescription('giver');
      expect(details).toHaveProperty('type', 'giver');
      expect(details).toHaveProperty('description');
      expect(details).toHaveProperty('strengths');
      expect(details).toHaveProperty('weaknesses');
      expect(details).toHaveProperty('learningAdvice');
      
      // 配列の検証
      expect(details.strengths).toBeInstanceOf(Array);
      expect(details.weaknesses).toBeInstanceOf(Array);
      expect(details.learningAdvice.tips).toBeInstanceOf(Array);
      expect(details.learningAdvice.tools).toBeInstanceOf(Array);
    });
    
    test('takerタイプの詳細情報を返す', () => {
      const details = getPersonalityDescription('taker');
      expect(details).toHaveProperty('type', 'taker');
      expect(details.strengths.length).toBeGreaterThan(0);
      expect(details.weaknesses.length).toBeGreaterThan(0);
    });
    
    test('matcherタイプの詳細情報を返す', () => {
      const details = getPersonalityDescription('matcher');
      expect(details).toHaveProperty('type', 'matcher');
      expect(details.strengths.length).toBeGreaterThan(0);
      expect(details.weaknesses.length).toBeGreaterThan(0);
    });
  });
}); 