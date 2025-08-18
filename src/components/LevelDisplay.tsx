'use client';

import React from 'react';
import { Level } from '@/types/common';
import { LEVELS } from '@/data/levels';

interface LevelDisplayProps {
  score: number;
}

export const LevelDisplay: React.FC<LevelDisplayProps> = ({ score }) => {
  const getCurrentLevel = (score: number): Level => {
    return LEVELS.reduce((highest, current) => {
      if (score >= current.requiredScore && current.number > highest.number) {
        return current;
      }
      return highest;
    }, LEVELS[0]);
  };

  const currentLevel = getCurrentLevel(score);
  const nextLevel = LEVELS.find(level => level.number === currentLevel.number + 1);
  const remainingPoints = nextLevel ? nextLevel.requiredScore - score : 0;

  return (
    <div className="level-display p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-2xl font-bold mb-4 text-primary">現在のレベル: {currentLevel.title}</h3>
      
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span>スコア: {score}点</span>
          {nextLevel && <span>次のレベルまで: {remainingPoints}点</span>}
        </div>
        
        <div className="relative h-2 bg-gray-200 rounded">
          {nextLevel && (
            <div 
              className="absolute h-full bg-primary rounded"
              style={{
                width: `${(score - currentLevel.requiredScore) / (nextLevel.requiredScore - currentLevel.requiredScore) * 100}%`
              }}
            />
          )}
        </div>
      </div>

      <div className="benefits">
        <h4 className="font-semibold mb-2">このレベルの特典:</h4>
        <ul className="list-disc list-inside space-y-1">
          {currentLevel.benefits.map((benefit, index) => (
            <li key={index} className="text-gray-700">{benefit}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}; 