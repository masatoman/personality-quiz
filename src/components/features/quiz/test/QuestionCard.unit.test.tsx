import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QuestionCard } from '../QuestionCard';
import { QuizQuestion } from '@/types/quiz';

// モックデータ
const mockQuestion: QuizQuestion = {
  id: 1,
  text: '学習スタイルに関する質問',
  description: '以下の選択肢から最も当てはまるものを選んでください',
  options: [
    { 
      text: '選択肢1', 
      score: { giver: 2, taker: 0, matcher: 1 }, 
      description: '説明1' 
    },
    { 
      text: '選択肢2', 
      score: { giver: 0, taker: 2, matcher: 1 }, 
      description: '説明2' 
    },
  ],
  category: 'visual'
};

describe('QuestionCard', () => {
  // 基本的なレンダリングのテスト
  test('コンポーネントが正しくレンダリングされる', () => {
    const mockHandlers = {
      onAnswer: jest.fn() as any
    };

    render(
      <QuestionCard 
        question={mockQuestion}
        currentQuestion={0}
        totalQuestions={5}
        onAnswer={mockHandlers.onAnswer}
      />
    );
    
    // 質問のテキストが表示されていることを確認
    expect(screen.getByText(/学習スタイルに関する質問/)).toBeInTheDocument();
    expect(screen.getByText(/以下の選択肢から最も当てはまるものを選んでください/)).toBeInTheDocument();
    
    // 質問番号が表示されていることを確認
    expect(screen.getByText(/質問 1:/)).toBeInTheDocument();
    
    // 選択肢が表示されていることを確認
    expect(screen.getByText('選択肢1')).toBeInTheDocument();
    expect(screen.getByText('選択肢2')).toBeInTheDocument();
    
    // 選択肢の説明が表示されていることを確認
    expect(screen.getByText('説明1')).toBeInTheDocument();
    expect(screen.getByText('説明2')).toBeInTheDocument();
  });

  // 選択肢をクリックしたときのテスト
  test('選択肢をクリックするとonAnswerが呼ばれる', () => {
    const mockHandlers = {
      onAnswer: jest.fn() as any
    };

    render(
      <QuestionCard 
        question={mockQuestion}
        currentQuestion={0}
        totalQuestions={5}
        onAnswer={mockHandlers.onAnswer}
      />
    );
    
    // 最初の選択肢をクリック
    fireEvent.click(screen.getByText('選択肢1'));
    
    // onAnswerが適切な引数で呼ばれることを確認
    expect(mockHandlers.onAnswer).toHaveBeenCalledWith(0);
    
    // 2番目の選択肢をクリック
    fireEvent.click(screen.getByText('選択肢2'));
    
    // onAnswerが2回目も適切な引数で呼ばれることを確認
    expect(mockHandlers.onAnswer).toHaveBeenCalledWith(1);
  });

  // 選択された選択肢のスタイルのテスト
  test('選択された選択肢が強調表示される', () => {
    const mockHandlers = {
      onAnswer: jest.fn() as any
    };

    const { rerender } = render(
      <QuestionCard 
        question={mockQuestion}
        currentQuestion={0}
        totalQuestions={5}
        onAnswer={mockHandlers.onAnswer}
      />
    );
    
    // 最初はどの選択肢も選択されていない
    // FaRegCheckCircleアイコンはsvgとして描画されるため、テキストコンテンツでは検出できない
    // 代わりに選択された状態のクラスを持つ要素がないことを確認
    const selectedOptions = document.querySelectorAll('.border-blue-500');
    expect(selectedOptions.length).toBe(0);
    
    // selectedOptionを指定して再レンダリング
    rerender(
      <QuestionCard 
        question={mockQuestion}
        currentQuestion={0}
        totalQuestions={5}
        onAnswer={mockHandlers.onAnswer}
        selectedOption={0}
      />
    );
    
    // 選択された選択肢には特定のスタイルクラスが適用されていることを確認
    const selectedOptionsAfter = document.querySelectorAll('.border-blue-500');
    expect(selectedOptionsAfter.length).toBe(1);
    
    // 選択された選択肢のテキストが正しいことを確認
    expect(selectedOptionsAfter[0].textContent).toContain('選択肢1');
  });

  // 説明のないオプションのテスト
  test('説明のないオプションも正しく表示される', () => {
    const questionWithoutDescription: QuizQuestion = {
      id: 2,
      text: '別の質問',
      options: [
        { 
          text: 'シンプルな選択肢', 
          score: { giver: 1, taker: 1, matcher: 1 } 
        },
      ],
      category: 'auditory'
    };

    const mockHandlers = {
      onAnswer: jest.fn() as any
    };

    render(
      <QuestionCard 
        question={questionWithoutDescription}
        currentQuestion={1}
        totalQuestions={5}
        onAnswer={mockHandlers.onAnswer}
      />
    );
    
    // 質問が表示されていることを確認
    expect(screen.getByText(/別の質問/)).toBeInTheDocument();
    
    // 選択肢が表示されていることを確認
    expect(screen.getByText('シンプルな選択肢')).toBeInTheDocument();
  });
}); 