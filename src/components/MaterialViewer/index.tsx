'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Section, QuizQuestion, ImageSection, TextSection, QuizSection } from '../../types/material';

interface MaterialViewerProps {
  sections: Section[];
  onComplete?: () => void;
  onQuizSubmit?: (quizId: string, answers: Record<string, string>, score: number) => void;
}

const MaterialViewer: React.FC<MaterialViewerProps> = ({ 
  sections, 
  onComplete,
  onQuizSubmit 
}) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, Record<string, string>>>({});
  const [quizResults, setQuizResults] = useState<Record<string, { score: number; total: number; submitted: boolean }>>({});
  const [activeTab, setActiveTab] = useState('content'); // content または outline

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
  const handleQuizAnswerChange = (quizId: string, questionId: string, answerId: string) => {
    setQuizAnswers(prev => ({
      ...prev,
      [quizId]: {
        ...(prev[quizId] || {}),
        [questionId]: answerId
      }
    }));
  };
  
  // クイズを提出して採点
  const submitQuiz = (quizSection: QuizSection) => {
    const answers = quizAnswers[quizSection.id] || {};
    const questions = quizSection.questions;
    
    let correctCount = 0;
    
    // 正答数を計算
    questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correctCount++;
      }
    });
    
    const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    
    // 結果を保存
    setQuizResults(prev => ({
      ...prev,
      [quizSection.id]: {
        score,
        total: questions.length,
        submitted: true
      }
    }));
    
    // コールバックがあれば呼び出し
    if (onQuizSubmit) {
      onQuizSubmit(quizSection.id, answers, score);
    }
  };
  
  // テキストセクションのレンダリング
  const renderTextSection = (section: TextSection) => (
    <div className="prose max-w-none">
      <h2 className="text-xl font-bold mb-4">{section.title}</h2>
      <div dangerouslySetInnerHTML={{ __html: section.content }} />
    </div>
  );
  
  // 画像セクションのレンダリング
  const renderImageSection = (section: ImageSection) => (
    <div>
      <h2 className="text-xl font-bold mb-4">{section.title}</h2>
      <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
        <Image
          src={section.imageUrl}
          alt={section.title}
          fill
          style={{ objectFit: 'contain' }}
        />
      </div>
      {section.description && (
        <p className="text-gray-600 mt-2">{section.description}</p>
      )}
    </div>
  );
  
  // クイズセクションのレンダリング
  const renderQuizSection = (section: QuizSection) => {
    const quizResult = quizResults[section.id];
    const isSubmitted = quizResult?.submitted;
    
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">{section.title}</h2>
        
        {isSubmitted ? (
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="font-bold text-lg">
                得点: {quizResult.score}% ({quizResult.total}問中{Math.round(quizResult.total * quizResult.score / 100)}問正解)
              </p>
            </div>
            
            <button
              onClick={() => setQuizResults(prev => ({
                ...prev,
                [section.id]: { ...quizResult, submitted: false }
              }))}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              再挑戦する
            </button>
          </div>
        ) : (
          <div>
            {section.questions.map((question, qIndex) => {
              const selectedAnswer = quizAnswers[section.id]?.[question.id];
              
              return (
                <div key={question.id} className="mb-8 p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium mb-3">
                    問題 {qIndex + 1}: {question.question}
                  </p>
                  
                  <div className="space-y-2">
                    {question.options.map(option => (
                      <label
                        key={option.id}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                          selectedAnswer === option.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`quiz-${section.id}-question-${question.id}`}
                          value={option.id}
                          checked={selectedAnswer === option.id}
                          onChange={() => handleQuizAnswerChange(section.id, question.id, option.id)}
                          className="mr-3"
                        />
                        <span>{option.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
            
            <button
              onClick={() => submitQuiz(section)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              disabled={
                !section.questions.every(q => quizAnswers[section.id]?.[q.id])
              }
            >
              回答を提出する
            </button>
          </div>
        )}
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
        return renderQuizSection(currentSection as QuizSection);
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
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('content')}
        >
          コンテンツ
        </button>
        <button
          className={`flex-1 px-4 py-3 text-center font-medium ${
            activeTab === 'outline' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
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
                  className="bg-blue-500 h-2 rounded-full"
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {currentSectionIndex < sections.length - 1 ? '次へ' : '完了'}
              </button>
            </div>
          </>
        ) : (
          /* 目次 */
          <div>
            <h2 className="text-xl font-bold mb-4">教材の目次</h2>
            <ul className="space-y-2">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <button
                    onClick={() => goToSection(index)}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${
                      index === currentSectionIndex
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 text-xs mr-3">
                      {index + 1}
                    </span>
                    <span className="flex-1">{section.title}</span>
                    {section.type === 'quiz' && quizResults[section.id]?.submitted && (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                        {quizResults[section.id].score}%
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialViewer; 