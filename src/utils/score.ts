import { ActivityType, ScoreChange, PersonalityType, MaterialType } from '@/types/quiz';

// 活動タイプによるギバースコアへの影響度
const SCORE_WEIGHTS: Record<ActivityType, ScoreChange> = {
  CREATE_CONTENT: {
    giver: 5,
    taker: 0,
    matcher: 2
  },
  PROVIDE_FEEDBACK: {
    giver: 3,
    taker: 0,
    matcher: 1
  },
  CONSUME_CONTENT: {
    giver: 0,
    taker: 2,
    matcher: 1
  },
  RECEIVE_FEEDBACK: {
    giver: 0,
    taker: 1,
    matcher: 1
  },
  SHARE_RESOURCE: {
    giver: 2,
    taker: 0,
    matcher: 1
  },
  ASK_QUESTION: {
    giver: 0,
    taker: 1,
    matcher: 1
  }
};

// 教材タイプによる重み付け係数
const MATERIAL_TYPE_MULTIPLIERS: Record<MaterialType, number> = {
  ARTICLE: 1.0,      // 記事は基本値
  VIDEO: 1.2,        // 動画は高い制作コストを反映
  QUIZ: 1.5,         // クイズは高いインタラクティブ性を反映
  FLASHCARD: 1.3,    // フラッシュカードはインタラクティブ性を反映
  EXERCISE: 1.4,     // 練習問題は高い教育効果を反映
  EBOOK: 1.1,        // eBookは長いコンテンツを反映
  AUDIO: 1.1,        // オーディオは聴覚学習を反映
  OTHER: 1.0         // その他は基本値
};

// 時間経過による減衰係数
// 日数に基づく減衰率を計算（30日で50%減衰するような指数関数）
export const calculateTimeDecay = (daysSinceActivity: number): number => {
  // 指数減衰パラメータ（30日で約50%の減衰）
  const decayParameter = 0.693 / 30;
  return Math.exp(-decayParameter * daysSinceActivity);
};

// 活動タイプに基づくスコア変化を計算
export const calculateScoreChange = (
  activityType: ActivityType, 
  materialType: MaterialType = 'OTHER', 
  daysSinceActivity: number = 0
): ScoreChange => {
  const baseScores = SCORE_WEIGHTS[activityType];
  const typeMultiplier = MATERIAL_TYPE_MULTIPLIERS[materialType];
  const timeDecay = calculateTimeDecay(daysSinceActivity);
  
  // 各スコアに重み付けと時間減衰を適用
  return {
    giver: Math.round(baseScores.giver * typeMultiplier * timeDecay),
    taker: Math.round(baseScores.taker * typeMultiplier * timeDecay),
    matcher: Math.round(baseScores.matcher * typeMultiplier * timeDecay)
  };
};

// 過去の履歴に基づくギバースコアの再計算
export const recalculateScores = (
  activities: Array<{
    activityType: ActivityType;
    materialType?: MaterialType; 
    timestamp: Date;
  }>
): ScoreChange => {
  const now = new Date();
  const totalScores: ScoreChange = { giver: 0, taker: 0, matcher: 0 };
  
  activities.forEach(activity => {
    // アクティビティからの経過日数を計算
    const daysSince = Math.floor((now.getTime() - activity.timestamp.getTime()) / (1000 * 60 * 60 * 24));
    
    // スコア変化を計算
    const scoreChange = calculateScoreChange(
      activity.activityType, 
      activity.materialType || 'OTHER', 
      daysSince
    );
    
    // 合計スコアに加算
    totalScores.giver += scoreChange.giver;
    totalScores.taker += scoreChange.taker;
    totalScores.matcher += scoreChange.matcher;
  });
  
  return totalScores;
};

// 最高のパーソナリティタイプを決定する
export const determinePersonalityType = (
  giverScore: number,
  takerScore: number,
  matcherScore: number
): PersonalityType => {
  const scores: Record<PersonalityType, number> = {
    giver: giverScore,
    taker: takerScore,
    matcher: matcherScore
  };

  let maxType: PersonalityType = 'matcher';
  let maxScore = -Infinity;

  (Object.entries(scores) as [PersonalityType, number][]).forEach(([type, score]) => {
    if (score > maxScore) {
      maxType = type;
      maxScore = score;
    }
  });

  return maxType;
};

// ギバースコアのレベルを計算（1-10のスケール）
export const calculateGiverLevel = (giverScore: number): number => {
  // スコアに基づくレベル（例：100ポイントごとに1レベルアップ、最大レベル10）
  const level = Math.floor(giverScore / 100) + 1;
  return Math.min(Math.max(level, 1), 10); // 1-10の範囲に制限
};

export const calculateProgress = (
  currentScores: ScoreChange,
  targetType: PersonalityType
): number => {
  const totalScore = Object.values(currentScores).reduce((a, b) => a + b, 0);
  const targetScore = currentScores[targetType];
  
  return totalScore === 0 ? 0 : (targetScore / totalScore) * 100;
}; 