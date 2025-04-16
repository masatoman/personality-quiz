'use client';

import { motion } from 'framer-motion';
import { GiverScore } from '@/types/giver-score';

type GiverScoreDisplayProps = {
  score: GiverScore;
};

export function GiverScoreDisplay({ score }: GiverScoreDisplayProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">ギバースコア</h2>
      
      <div className="space-y-4">
        <div className="text-center">
          <span className="text-3xl font-bold">{score.level}</span>
          <span className="text-gray-600 ml-2">レベル</span>
        </div>

        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="absolute h-full bg-blue-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${score.progress}%` }}
            transition={{ duration: 0.5 }}
            role="progressbar"
            aria-valuenow={score.progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        <div className="text-sm text-gray-600 text-center">
          次のレベルまで: {score.pointsToNextLevel}ポイント
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold mb-2">あなたの性格タイプ</h3>
          <p className="text-lg font-bold text-center capitalize">
            {score.personalityType}
          </p>
        </div>
      </div>
    </div>
  );
} 