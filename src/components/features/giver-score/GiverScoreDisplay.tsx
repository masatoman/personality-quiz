import React from 'react';
import { FC } from 'react';
import { GiverScore } from '@/types/giver-score';

interface GiverScoreDisplayProps {
  score: GiverScore;
}

// パーソナリティタイプごとの色マップ
const PERSONALITY_COLORS = {
  giver: 'bg-green-500',
  taker: 'bg-blue-500',
  matcher: 'bg-purple-500'
};

export const GiverScoreDisplay: FC<GiverScoreDisplayProps> = ({ score }) => {
  const { level, points, progress, pointsToNextLevel, personalityType } = score;
  
  // アニメーションの設定
  const progressAnimation: React.CSSProperties = {
    width: `${progress}%`
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
          <p className="text-2xl font-bold">{points}</p>
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