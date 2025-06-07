'use client';

import React, { useState, useCallback } from 'react';
import { Section, Question, ImageSection, TextSection } from '../../types/material';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import type { QuizSection as QuizSectionType } from '../../types/material';

interface MaterialViewerProps {
  sections: Section[];
  onComplete?: () => void;
  onQuizSubmit?: (quizId: string, answers: Record<string, number>, score: number) => void;
}

const MaterialViewer: React.FC<MaterialViewerProps> = ({ 
  sections, 
  onComplete,
  onQuizSubmit 
}) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, Record<string, number>>>({});
  const [quizResults, setQuizResults] = useState<Record<string, { score: number; submitted: boolean }>>({});
  const [activeTab, setActiveTab] = useState('content'); // content または outline
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const currentSection = sections[currentSectionIndex];
  
  // 次のセクションに進む
  const goToNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      window.scrollTo(0, 0);
    } else if (onComplete) {
      onComplete();
    }
  };
  
  // 前のセクションに戻る
  const goToPrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      window.scrollTo(0, 0);
    }
  };
  
  // 特定のセクションに移動
  const goToSection = (index: number) => {
    setCurrentSectionIndex(index);
    setActiveTab('content');
    window.scrollTo(0, 0);
  };
  
  // クイズの回答を更新
  const handleQuizAnswerChange = (quizId: string, questionId: string, answerId: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [quizId]: {
        ...(prev[quizId] || {}),
        [questionId]: answerId
      }
    }));
  };
  
  // クイズの採点を行う
  const handleQuizSubmit = useCallback((quizId: string, questions: Question[]) => {
    const answers = quizAnswers[quizId] || {};
    let correctCount = 0;
    
    questions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    
    setQuizResults((prev) => ({
      ...prev,
      [quizId]: { score, submitted: true }
    }));

    onQuizSubmit?.(quizId, answers, score);
  }, [quizAnswers, onQuizSubmit]);
  
  // テキストセクションのレンダリング
  const renderTextSection = (section: TextSection) => {
    const maxLength = 500; // 表示する最大文字数
    const content = section.content || '';
    const isLongContent = content.length > maxLength;
    const isExpanded = expandedSections[section.id] || false;

    const toggleExpand = () => {
      setExpandedSections(prev => ({
        ...prev,
        [section.id]: !prev[section.id]
      }));
    };

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
        <div className={`relative ${!isExpanded && isLongContent ? 'max-h-[300px] overflow-hidden' : ''}`}>
          <div className={`prose max-w-none ${!isExpanded && isLongContent ? 'mask-bottom' : ''}`}
            dangerouslySetInnerHTML={{ 
              __html: isExpanded ? content : content.slice(0, maxLength) + (isLongContent ? '...' : '') 
            }} 
          />
          {isLongContent && (
            <div className={`${!isExpanded ? 'absolute bottom-0 w-full pt-16 pb-4 bg-gradient-to-t from-white' : 'mt-4'}`}>
              <button
                onClick={toggleExpand}
                                    className="px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-800 focus:outline-none"
              >
                {isExpanded ? '折りたたむ' : 'もっと見る'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // 画像セクションのレンダリング
  const renderImageSection = (section: ImageSection) => (
    <div>
      <h2 className="text-xl font-bold mb-4">{section.title}</h2>
      <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
        <OptimizedImage
          src={section.imageUrl}
          alt={section.altText || section.title}
          fill
          objectFit="contain"
        />
      </div>
      {section.description && (
        <p className="text-gray-600 mt-2">{section.description}</p>
      )}
    </div>
  );
  
  // クイズセクションのレンダリング
  const renderQuizSection = (section: QuizSectionType) => {
    const quizResult = quizResults[section.id];
    const answers = quizAnswers[section.id] || {};
    const isSubmitted = !!quizResult;
    
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
        
        {isSubmitted && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
            <p className="font-bold text-lg">
              得点: {quizResult.score}% ({section.questions.length}問中{Math.round(section.questions.length * quizResult.score / 100)}問正解)
            </p>
          </div>
        )}
        
        {section.questions.map((question, index) => (
          <div key={question.id} className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="font-medium text-lg mb-4">問題 {index + 1}: {question.question}</p>
            <div className="space-y-3">
              {question.options.map((option, optIdx) => (
                <label key={optIdx} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={optIdx}
                    checked={answers[question.id] === optIdx}
                    onChange={() => handleQuizAnswerChange(section.id, question.id, optIdx)}
                    disabled={isSubmitted}
                    className="h-4 w-4 text-emerald-600"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        
        <div className="flex justify-end">
          {isSubmitted ? (
            <button
              onClick={() => setQuizResults(prev => {
                const newResults = { ...prev };
                delete newResults[section.id];
                return newResults;
              })}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              やり直す
            </button>
          ) : (
            <button
              onClick={() => handleQuizSubmit(section.id, section.questions)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              回答を送信
            </button>
          )}
        </div>
      </div>
    );
  };
  
  // 現在のセクションに応じたコンテンツをレンダリング
  const renderSectionContent = () => {
    if (!currentSection) return <p>セクションが見つかりません</p>;
    
    switch (currentSection.type) {
      case 'text':
        return renderTextSection(currentSection as TextSection);
      case 'image':
        return renderImageSection(currentSection as ImageSection);
      case 'quiz':
        return renderQuizSection(currentSection as QuizSectionType);
      default:
        return <p>サポートされていないセクションタイプです</p>;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* タブ */}
      <div className="flex border-b">
        <button
          className={`flex-1 px-4 py-3 text-center font-medium ${
            activeTab === 'content' 
              ? 'border-b-2 border-emerald-500 text-emerald-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('content')}
        >
          コンテンツ
        </button>
        <button
          className={`flex-1 px-4 py-3 text-center font-medium ${
            activeTab === 'outline' 
              ? 'border-b-2 border-emerald-500 text-emerald-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('outline')}
        >
          目次
        </button>
      </div>
      
      {/* メインコンテンツ */}
      <div className="p-6">
        {activeTab === 'content' ? (
          <>
            {/* セクション進捗表示 */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-500">
                セクション {currentSectionIndex + 1} / {sections.length}
              </p>
              <div className="w-2/3 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${((currentSectionIndex + 1) / sections.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* セクションコンテンツ */}
            {renderSectionContent()}
            
            {/* ナビゲーションボタン */}
            <div className="flex justify-between mt-8">
              <button
                onClick={goToPrevSection}
                disabled={currentSectionIndex === 0}
                className={`px-4 py-2 rounded-lg ${
                  currentSectionIndex === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                前へ
              </button>
              <button
                onClick={goToNextSection}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                {currentSectionIndex < sections.length - 1 ? '次へ' : '完了'}
              </button>
            </div>
          </>
        ) : (
          /* 目次 */
          <div className="divide-y">
            {sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => goToSection(index)}
                className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 transition text-left"
              >
                <span className="flex-none w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm text-gray-600">
                  {index + 1}
                </span>
                <span className="flex-1">{section.title}</span>
                {section.type === 'quiz' && quizResults[section.id] && (
                  <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700">
                    {quizResults[section.id].score}%
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialViewer; 