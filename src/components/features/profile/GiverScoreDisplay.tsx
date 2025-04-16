import React from 'react';
import { PersonalityType } from '../../../types/quiz';

interface UserData {
  score: number;
  level: number;
  nextLevelScore: number;
  progressPercentage: number;
  personalityType: PersonalityType;
}

interface GiverScoreDisplayProps {
  userData: UserData;
}

const GiverScoreDisplay: React.FC<GiverScoreDisplayProps> = ({ userData }) => {
  return (
    <div className="giver-score bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">ギバースコア</h2>
      <div className="score-display text-center mb-4">
        <div className="text-4xl font-bold text-blue-600">{userData.score}</div>
        <div className="text-sm text-gray-500">レベル {userData.level}</div>
      </div>
      
      <div className="progress-bar mb-2 bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${userData.progressPercentage}%` }}
        ></div>
      </div>
      
      <div className="text-sm text-gray-500 text-center mb-4">
        次のレベルまで: {userData.nextLevelScore - userData.score}ポイント
      </div>
      
      <div className="personality-type text-center">
        <div className="text-sm font-medium mb-1">あなたのタイプ</div>
        <div className={`text-lg font-bold ${
          userData.personalityType === 'giver' ? 'text-blue-600' :
          userData.personalityType === 'matcher' ? 'text-green-600' :
          'text-purple-600'
        }`}>
          {userData.personalityType === 'giver' ? 'ギバー' :
           userData.personalityType === 'matcher' ? 'マッチャー' :
           'テイカー'}
        </div>
      </div>
    </div>
  );
};

export default GiverScoreDisplay; 