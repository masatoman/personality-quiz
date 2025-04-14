import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import QuizClient from '../QuizClient';
import { saveQuizResults } from '../QuizApiService';
import { questions } from '@/data/questions';
import type { QuizQuestion, QuizResults } from '@/types/quiz';

// Constants
const ERROR_MESSAGES = {
  SAVE_RESULTS: '結果の保存中にエラーが発生しました:'
} as const;

// Mock setup
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('../QuizApiService', () => ({
  saveQuizResults: jest.fn()
}));

const mockQuestions: QuizQuestion[] = [
  {
    id: 1,
    text: 'テスト質問1',
    options: [
      { text: '選択肢1', score: { giver: 2, taker: 1, matcher: 0 } },
      { text: '選択肢2', score: { giver: 1, taker: 2, matcher: 0 } }
    ]
  },
  {
    id: 2,
    text: 'テスト質問2',
    options: [
      { text: '選択肢1', score: { giver: 1, taker: 0, matcher: 2 } },
      { text: '選択肢2', score: { giver: 0, taker: 2, matcher: 1 } }
    ]
  }
];

jest.mock('@/data/questions', () => ({
  questions: mockQuestions
}));

describe('QuizClient', () => {
  const mockRouter = {
    push: jest.fn()
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (saveQuizResults as jest.Mock).mockResolvedValue(undefined);
    localStorage.clear();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('displays loading spinner initially', () => {
      render(<QuizClient />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('removes loading spinner after data is loaded', async () => {
      render(<QuizClient />);
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });
  });

  describe('Quiz Progress', () => {
    it('starts quiz from intro screen', async () => {
      render(<QuizClient />);
      await waitFor(() => {
        expect(screen.getByText('クイズを開始')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('クイズを開始'));
      expect(screen.getByText('テスト質問1')).toBeInTheDocument();
    });

    it('navigates to next question after answering', async () => {
      render(<QuizClient />);
      await waitFor(() => {
        fireEvent.click(screen.getByText('クイズを開始'));
      });

      fireEvent.click(screen.getByText('選択肢1'));
      fireEvent.click(screen.getByText('次へ'));

      expect(screen.getByText('テスト質問2')).toBeInTheDocument();
    });

    it('updates progress bar correctly', async () => {
      render(<QuizClient />);
      await waitFor(() => {
        fireEvent.click(screen.getByText('クイズを開始'));
      });

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');

      fireEvent.click(screen.getByText('選択肢1'));
      fireEvent.click(screen.getByText('次へ'));

      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });

    it('allows navigation to previous question', async () => {
      render(<QuizClient />);
      await waitFor(() => {
        fireEvent.click(screen.getByText('クイズを開始'));
      });

      fireEvent.click(screen.getByText('選択肢1'));
      fireEvent.click(screen.getByText('次へ'));

      fireEvent.click(screen.getByText('前へ'));
      expect(screen.getByText('テスト質問1')).toBeInTheDocument();
    });
  });

  describe('Results Calculation and Storage', () => {
    it('calculates and saves results after answering all questions', async () => {
      render(<QuizClient />);
      await waitFor(() => {
        fireEvent.click(screen.getByText('クイズを開始'));
      });

      fireEvent.click(screen.getByText('選択肢1')); // Question 1
      fireEvent.click(screen.getByText('次へ'));
      fireEvent.click(screen.getByText('選択肢1')); // Question 2
      fireEvent.click(screen.getByText('次へ'));

      await waitFor(() => {
        expect(saveQuizResults).toHaveBeenCalled();
      });

      const savedResults = JSON.parse(localStorage.getItem('quizResults') || '{}');
      expect(savedResults).toHaveProperty('dominantType');
      expect(mockRouter.push).toHaveBeenCalledWith(expect.stringContaining('/quiz/results'));
    });

    it('saves to localStorage and navigates to results page even if API fails', async () => {
      (saveQuizResults as jest.Mock).mockRejectedValue(new Error('API error'));
      
      render(<QuizClient />);
      await waitFor(() => {
        fireEvent.click(screen.getByText('クイズを開始'));
      });

      fireEvent.click(screen.getByText('選択肢1'));
      fireEvent.click(screen.getByText('次へ'));
      fireEvent.click(screen.getByText('選択肢1'));
      fireEvent.click(screen.getByText('次へ'));

      await waitFor(() => {
        const savedResults = JSON.parse(localStorage.getItem('quizResults') || '{}');
        expect(savedResults).toHaveProperty('dominantType');
        expect(mockRouter.push).toHaveBeenCalledWith(expect.stringContaining('/quiz/results'));
      });

      expect(console.error).toHaveBeenCalledWith(
        ERROR_MESSAGES.SAVE_RESULTS,
        expect.any(Error)
      );
    });
  });
}); 