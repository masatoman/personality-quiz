import React, { useMemo } from 'react';
import { motion, MotionStyle } from 'framer-motion';
import { HiGift, HiStar, HiLightningBolt, HiUser, HiTrendingUp, HiAcademicCap } from 'react-icons/hi';
import { FC } from 'react';
import { GiverScore } from '@/types/giver-score';

interface UserData {
  id: string;
  name: string;
  email: string;
  score: number;
  activities: number;
  level: number;
  nextLevelScore: number;
  progressPercentage: number;
  personalityType: 'giver' | 'taker' | 'matcher';
  learningStreak: number;
  contributionStats: {
    createdContent: number;
    providedFeedback: number;
    helpedUsers: number;
  };
}

interface GiverScoreDisplayProps {
  score: GiverScore;
}

// レベルごとの特典マップ（実際の実装に合わせて調整してください）
const LEVEL_BENEFITS: Record<number, string[]> = {
  1: ['基本機能の利用'],
  2: ['詳細フィードバック機能', 'ポイント2倍デー'],
  3: ['教材ブックマーク機能', 'バッジシステムのロック解除'],
  4: ['教材作成機能のロック解除', 'ギバーコミュニティへのアクセス'],
  5: ['他ユーザーのメンター登録', 'カスタムテーマ'],
  6: ['リソース提案機能', 'ギバーSNSバッジの獲得'],
  7: ['上級者向け教材の作成許可', 'プライオリティサポート'],
  8: ['ギバーリーダーボードへの参加', 'VIPイベントへの招待'],
  9: ['プラットフォームの意思決定権限', 'ギバー認定バッジ'],
  10: ['無制限の教材作成', 'マスターメンターステータス', 'ギバーTシャツの贈呈']
};

// パーソナリティタイプごとのアイコンマップ
const PERSONALITY_ICONS = {
  giver: <HiGift data-testid="giver-icon" className="text-green-500" size={24} />,
  taker: <HiStar data-testid="taker-icon" className="text-blue-500" size={24} />,
  matcher: <HiLightningBolt data-testid="matcher-icon" className="text-purple-500" size={24} />
};

// パーソナリティタイプごとの色マップ
const PERSONALITY_COLORS = {
  giver: 'bg-green-500',
  taker: 'bg-blue-500',
  matcher: 'bg-purple-500'
};

export const GiverScoreDisplay: FC<GiverScoreDisplayProps> = ({ score }) => {
  const { level, nextLevelScore, progressPercentage, personalityType, activities, learningStreak, contributionStats } = score as UserData;
  
  // メモ化された計算
  const pointsToNextLevel = useMemo(() => nextLevelScore - score.points, [nextLevelScore, score.points]);
  const currentBenefits = useMemo(() => LEVEL_BENEFITS[level] || [], [level]);
  
  // アニメーションの設定
  const progressAnimation: MotionStyle = {
    width: `${progressPercentage}%`
  };

  const progressTransition = {
    duration: 0.5,
    ease: "easeOut" as const
  };
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">ギバースコア</h2>
      <div className="grid gap-4">
        <div>
          <p className="text-sm text-gray-600">レベル</p>
          <p className="text-2xl font-bold">{level}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">ポイント</p>
          <p className="text-2xl font-bold">{score.points}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">次のレベルまで</p>
          <div className="relative pt-1">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
              <div
                style={progressAnimation}
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${PERSONALITY_COLORS[personalityType]}`}
              />
            </div>
            <p className="text-right text-sm text-gray-600">
              あと{pointsToNextLevel}ポイント
            </p>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-600">パーソナリティタイプ</p>
          <p className="text-lg font-semibold capitalize">{personalityType.charAt(0).toUpperCase() + personalityType.slice(1)}</p>
        </div>
      </div>
    </div>
  );
}; 