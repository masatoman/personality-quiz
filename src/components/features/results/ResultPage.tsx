import React from 'react';
import { PersonalityType } from '@/types/quiz';

interface ResultPageProps {
  results: {
    type: PersonalityType;
    description: string;
    strengths: string[];
    weaknesses: string[];
    learningAdvice: {
      title: string;
      description: string;
      tips: string[];
      tools: string[];
    };
  };
  onRestartTest: () => void;
}

export function ResultPage({ results, onRestartTest }: ResultPageProps) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 py-8 px-4">
      <div className="result-section">
        <div className="result-header">
          <div className="type-badge">{results.type}</div>
          <h1>あなたの英語学習タイプは「{results.type}」です</h1>
        </div>
        
        <div className="type-description">
          {results.description}
        </div>
        
        <div className="strengths-weaknesses">
          <div className="section-title">
            <svg className="strength-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            強み
          </div>
          <ul className="feature-list">
            {results.strengths.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
          
          <div className="section-title">
            <svg className="weakness-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            弱み
          </div>
          <ul className="feature-list">
            {results.weaknesses.map((weakness, index) => (
              <li key={index}>{weakness}</li>
            ))}
          </ul>
        </div>
        
        <div className="recommendations">
          <h2>{results.learningAdvice.title}</h2>
          
          <div className="recommendation-section">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              おすすめの学習方法
            </h3>
            <ul className="feature-list">
              {results.learningAdvice.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
          
          <div className="recommendation-section">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              おすすめの学習ツール
            </h3>
            <ul className="feature-list">
              {results.learningAdvice.tools.map((tool, index) => (
                <li key={index}>{tool}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <button onClick={onRestartTest} className="retry-button">
          もう一度診断する
        </button>
      </div>
    </main>
  );
} 