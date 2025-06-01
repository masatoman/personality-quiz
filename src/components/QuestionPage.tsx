import React from 'react';
import { QuizQuestion } from '@/types/quiz';

interface QuestionPageProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  onAnswerSelect: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
  progress: number;
}

export const QuestionPage: React.FC<QuestionPageProps> = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  onNext,
  onPrev,
  progress
}) => {
  return (
    <div className="question-card">
      <div className="progress-container">
        <div className="progress-info">
          <span>Question {questionNumber}/{totalQuestions}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="question-container">
        <h2>{question.text}</h2>
        <div className="options-container">
          {question.options.map((option, index) => (
            <button
              key={index}
              className={`option-button ${selectedAnswer === index ? 'selected-option' : ''}`}
              onClick={() => onAnswerSelect(index)}
            >
              {option.text}
            </button>
          ))}
        </div>
      </div>

      <div className="navigation-buttons">
        {questionNumber > 1 && (
          <button className="nav-button prev" onClick={onPrev}>
            前の質問
          </button>
        )}
        <button
          className={`nav-button next ${selectedAnswer === null ? 'disabled' : ''}`}
          onClick={onNext}
          disabled={selectedAnswer === null}
        >
          {questionNumber === totalQuestions ? '結果を見る' : '次の質問'}
        </button>
      </div>
    </div>
  );
}; 