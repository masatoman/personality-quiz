import { calculateTimeDecay, calculateGiverLevel, determinePersonalityType } from '../index';
import { ScoreChange } from '@/types/quiz';

describe('GiverScoreCalculator', () => {
  describe('calculateTimeDecay', () => {
    it('0日の場合は減衰なしで1.0を返す', () => {
      expect(calculateTimeDecay(0)).toBe(1);
    });

    it('30日経過で約50%に減衰する', () => {
      const decay = calculateTimeDecay(30);
      expect(decay).toBeCloseTo(0.5, 1);
    });

    it('60日経過で約25%に減衰する', () => {
      const decay = calculateTimeDecay(60);
      expect(decay).toBeCloseTo(0.25, 1);
    });
  });

  describe('calculateGiverLevel', () => {
    it('スコア0はレベル1になる', () => {
      expect(calculateGiverLevel(0)).toBe(1);
    });

    it('スコア50はレベル1になる', () => {
      expect(calculateGiverLevel(50)).toBe(1);
    });

    it('スコア100はレベル2になる', () => {
      expect(calculateGiverLevel(100)).toBe(2);
    });

    it('スコア350はレベル4になる', () => {
      expect(calculateGiverLevel(350)).toBe(4);
    });

    it('スコア999はレベル10になる（最大値制限）', () => {
      expect(calculateGiverLevel(999)).toBe(10);
    });
  });

  describe('determinePersonalityType', () => {
    it('ギバースコアが最も高いとギバータイプになる', () => {
      expect(determinePersonalityType(10, 5, 3)).toBe('giver');
    });

    it('テイカースコアが最も高いとテイカータイプになる', () => {
      expect(determinePersonalityType(5, 10, 3)).toBe('taker');
    });

    it('マッチャースコアが最も高いとマッチャータイプになる', () => {
      expect(determinePersonalityType(5, 3, 10)).toBe('matcher');
    });

    it('同点の場合は最初に見つかったタイプが選ばれる', () => {
      // 全て同点の場合、実装では最初にチェックされるタイプ（giver）が選ばれる
      expect(determinePersonalityType(5, 5, 5)).toBe('giver');
    });
  });
}); 