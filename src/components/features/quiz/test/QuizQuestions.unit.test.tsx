import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuizQuestions from '../QuizQuestions';
import { QuizQuestion, QuizOption } from '@/types/quiz';

// モックデータ
const mockQuestions: QuizQuestion[] = [
  {
    id: 1,
    text: '学習スタイルに関する質問1',
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
  },
  {
    id: 2,
    text: '学習スタイルに関する質問2',
    options: [
      { 
        text: '選択肢3', 
        score: { giver: 1, taker: 1, matcher: 2 } 
      },
      { 
        text: '選択肢4', 
        score: { giver: 2, taker: 2, matcher: 0 } 
      },
    ],
    category: 'auditory'
  }
];

describe('QuizQuestions', () => {
  // 基本的なレンダリングのテスト
  test('コンポーネントが正しくレンダリングされる', () => {
    const mockHandlers = {
      onOptionSelect: jest.fn() as any,
      onPrevious: jest.fn() as any,
      onNext: jest.fn() as any
    };

    render(
      <QuizQuestions
        questions={mockQuestions}
        currentQuestionIndex={0}
        selectedOption={null}
        direction={1}
        progress={50}
        onOptionSelect={mockHandlers.onOptionSelect}
        onPrevious={mockHandlers.onPrevious}
        onNext={mockHandlers.onNext}
      />
    );
    
    // 質問テキストが表示されていることを確認
    expect(screen.getByText(/学習スタイルに関する質問1/)).toBeInTheDocument();
    expect(screen.getByText(/以下の選択肢から最も当てはまるものを選んでください/)).toBeInTheDocument();
    
    // 選択肢が表示されていることを確認
    expect(screen.getByText('選択肢1')).toBeInTheDocument();
    expect(screen.getByText('選択肢2')).toBeInTheDocument();
    
    // ナビゲーションボタンが表示されていることを確認
    expect(screen.getByText('前の質問')).toBeInTheDocument();
    expect(screen.getByText('次の質問')).toBeInTheDocument();
  });

  // ナビゲーションボタンのテスト
  test('前の質問ボタンは最初の質問で無効になる', () => {
    const mockHandlers = {
      onOptionSelect: jest.fn() as any,
      onPrevious: jest.fn() as any,
      onNext: jest.fn() as any
    };

    render(
      <QuizQuestions
        questions={mockQuestions}
        currentQuestionIndex={0}
        selectedOption={null}
        direction={1}
        progress={50}
        onOptionSelect={mockHandlers.onOptionSelect}
        onPrevious={mockHandlers.onPrevious}
        onNext={mockHandlers.onNext}
      />
    );
    
    // 前の質問ボタンが無効になっていることを確認
    const prevButton = screen.getByText('前の質問').closest('button');
    expect(prevButton).toBeDisabled();
  });

  // オプション選択のテスト
  test('オプションをクリックすると選択イベントが発火する', () => {
    const mockHandlers = {
      onOptionSelect: jest.fn() as any,
      onPrevious: jest.fn() as any,
      onNext: jest.fn() as any
    };

    render(
      <QuizQuestions
        questions={mockQuestions}
        currentQuestionIndex={0}
        selectedOption={null}
        direction={1}
        progress={50}
        onOptionSelect={mockHandlers.onOptionSelect}
        onPrevious={mockHandlers.onPrevious}
        onNext={mockHandlers.onNext}
      />
    );
    
    // 選択肢をクリック
    fireEvent.click(screen.getByText('選択肢1'));
    
    // onOptionSelectが呼ばれたことを確認
    expect(mockHandlers.onOptionSelect).toHaveBeenCalledWith(0);
  });

  // 最後の質問での次へボタンテスト
  test('最後の質問では「結果を見る」と表示される', () => {
    const mockHandlers = {
      onOptionSelect: jest.fn() as any,
      onPrevious: jest.fn() as any,
      onNext: jest.fn() as any
    };

    render(
      <QuizQuestions
        questions={mockQuestions}
        currentQuestionIndex={1} // 最後の質問
        selectedOption={0} // オプションが選択されている
        direction={1}
        progress={100}
        onOptionSelect={mockHandlers.onOptionSelect}
        onPrevious={mockHandlers.onPrevious}
        onNext={mockHandlers.onNext}
      />
    );
    
    // 結果を見るボタンが表示されていることを確認
    expect(screen.getByText('結果を見る')).toBeInTheDocument();
    expect(screen.queryByText('次の質問')).not.toBeInTheDocument();
  });

  // 選択肢がない場合のテスト
  test('選択肢がない場合、次へボタンは無効になる', () => {
    const mockHandlers = {
      onOptionSelect: jest.fn() as any,
      onPrevious: jest.fn() as any,
      onNext: jest.fn() as any
    };

    render(
      <QuizQuestions
        questions={mockQuestions}
        currentQuestionIndex={0}
        selectedOption={null} // 何も選択されていない
        direction={1}
        progress={50}
        onOptionSelect={mockHandlers.onOptionSelect}
        onPrevious={mockHandlers.onPrevious}
        onNext={mockHandlers.onNext}
      />
    );
    
    // 次の質問ボタンが無効になっていることを確認
    const nextButton = screen.getByText('次の質問').closest('button');
    expect(nextButton).toBeDisabled();
  });
}); 