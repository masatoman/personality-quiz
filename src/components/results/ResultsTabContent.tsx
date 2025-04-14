'use client';

import React from 'react';
import { LearningType } from '@/types/quiz';
import { ResultsData, TabType } from '@/types/results';
import { FaCheckCircle, FaExclamationCircle, FaLightbulb } from 'react-icons/fa';
import { VirtualScrollContainer } from '../VirtualScrollContainer';

interface ResultsTabContentProps {
  tab: TabType;
  data: ResultsData;
  learningType: {
    primary: LearningType;
    secondary: LearningType;
    scores: {
      giver: number;
      taker: number;
      matcher: number;
    };
  };
}

interface Recommendation {
  title: string;
  description: string;
  link?: string;
}

const ResultsTabContent: React.FC<ResultsTabContentProps> = ({
  tab,
  data,
  learningType
}) => {
  const { primary, secondary } = learningType;
  const primaryInfo = data.personalityInfo[primary];
  const secondaryInfo = data.personalityInfo[secondary];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          あなたの学習スタイルの特徴
        </h3>
        <p className="text-gray-700 mb-6">
          {primaryInfo.description}と{secondaryInfo.description}の特徴を併せ持つ、
          バランスの取れた学習者タイプです。
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">
              主要タイプの特徴
            </h4>
            <ul className="space-y-2">
              {primaryInfo.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">
              副次タイプの特徴
            </h4>
            <ul className="space-y-2">
              {secondaryInfo.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <FaCheckCircle className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStrengths = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          あなたの強み
        </h3>
        <div className="grid gap-4">
          {[...primaryInfo.strengths, ...secondaryInfo.strengths].map((strength, index) => (
            <div key={index} className="flex items-start bg-white rounded-lg p-4 shadow-sm">
              <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
              <p className="text-gray-700">{strength}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderWeaknesses = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          改善が必要な点
        </h3>
        <div className="grid gap-4">
          {[...primaryInfo.weaknesses, ...secondaryInfo.weaknesses].map((weakness, index) => (
            <div key={index} className="flex items-start bg-white rounded-lg p-4 shadow-sm">
              <FaExclamationCircle className="text-red-500 mt-1 mr-3 flex-shrink-0" />
              <p className="text-gray-700">{weakness}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTips = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          改善のためのヒント
        </h3>
        <div className="grid gap-4">
          {[...primaryInfo.tips, ...secondaryInfo.tips].map((tip, index) => (
            <div key={index} className="flex items-start bg-white rounded-lg p-4 shadow-sm">
              <FaLightbulb className="text-yellow-500 mt-1 mr-3 flex-shrink-0" />
              <p className="text-gray-700">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const contentMap = {
    overview: renderOverview,
    strengths: renderStrengths,
    weaknesses: renderWeaknesses,
    tips: renderTips
  };

  // タブコンテンツのレンダリング（メモ化）
  const renderTabContent = React.useMemo(() => {
    switch (tab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <VirtualScrollContainer<string>
              items={data.personalityInfo[learningType.primary].strengths}
              height={400}
              itemHeight={60}
              renderItem={(strength: string, index: number) => (
                <div key={index} className="p-4 bg-white rounded-lg shadow mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">強み {index + 1}</h3>
                  <p className="text-gray-600">{strength}</p>
                </div>
              )}
            />
          </div>
        );
      
      case 'details':
        return (
          <div className="space-y-6">
            <VirtualScrollContainer<string>
              items={data.personalityInfo[learningType.primary].tips}
              height={400}
              itemHeight={80}
              renderItem={(tip: string, index: number) => (
                <div key={index} className="p-4 bg-white rounded-lg shadow mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">アドバイス {index + 1}</h3>
                  <p className="text-gray-600">{tip}</p>
                </div>
              )}
            />
          </div>
        );
      
      case 'recommendations':
        return (
          <div className="space-y-6">
            <VirtualScrollContainer<Recommendation>
              items={data.recommendations}
              height={500}
              itemHeight={120}
              renderItem={(recommendation: Recommendation, index: number) => (
                <div key={index} className="p-4 bg-white rounded-lg shadow mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{recommendation.title}</h3>
                  <p className="text-gray-600">{recommendation.description}</p>
                  {recommendation.link && (
                    <a
                      href={recommendation.link}
                      className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
                    >
                      詳細を見る →
                    </a>
                  )}
                </div>
              )}
            />
          </div>
        );
      
      default:
        return null;
    }
  }, [tab, data, learningType]);

  return (
    <div className="results-content mt-6 overflow-hidden">
      {renderTabContent}
    </div>
  );
};

export default React.memo(ResultsTabContent); 