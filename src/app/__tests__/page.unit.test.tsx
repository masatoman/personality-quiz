/// <reference types="@testing-library/jest-dom" />
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import Home from '../page';
import { useRouter } from 'next/navigation';
import { test, expect } from '@playwright/test';
import type { Matchers } from '@testing-library/jest-dom';

// カスタムマッチャーの型定義
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveStyle(style: Record<string, any>): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveClass(className: string): R;
    }
  }
}

// useRouterのモック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}));

// window.openのモック
const mockOpen = jest.fn().mockImplementation(() => null) as unknown as jest.Mock;
Object.defineProperty(window, 'open', {
  value: mockOpen,
  writable: true,
  configurable: true
});

// fetchのモック
const mockFetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    headers: new Headers(),
    json: () => Promise.resolve({ 
      stats: {
        giver: { count: 4, percentage: 23.5 },
        taker: { count: 6, percentage: 35.3 },
        matcher: { count: 7, percentage: 41.2 }
      }
    })
  } as Response)
) as unknown as jest.Mock;

global.fetch = mockFetch;

// テストのセットアップ
beforeAll(() => {
  // window.open のモック
  Object.defineProperty(window, 'open', {
    value: mockOpen,
    writable: true,
    configurable: true
  });
  
  // fetch のモック
  global.fetch = mockFetch;
});

describe('Home', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockOpen.mockClear();
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const startDiagnosis = async () => {
    const startButton = screen.getByText('診断を始める');
    await act(async () => {
      await userEvent.click(startButton);
    });
  };

  it('最初の質問が表示される', async () => {
    render(<Home />);
    await startDiagnosis();
    
    const questionText = screen.getByText((content, element) => {
      return element?.textContent === '質問 1 / 10';
    });
    
    expect(questionText).toBeInTheDocument();
    expect(screen.getByText('英語の授業で新しい単語を覚えるとき、どの方法が最も自然に感じますか？')).toBeInTheDocument();
  });

  it('質問に回答すると次の質問に進む', async () => {
    render(<Home />);
    await startDiagnosis();
    
    const firstOption = screen.getByText('単語の意味を他の人に説明しながら覚える');
    await act(async () => {
      await userEvent.click(firstOption);
    });

    // 選択後すぐには次の質問に進まないことを確認
    expect(screen.getByText('質問 1 / 10')).toBeInTheDocument();

    // 次へボタンをクリック
    const nextButton = screen.getByText('次へ');
    await act(async () => {
      await userEvent.click(nextButton);
    });

    const questionText = screen.getByText((content, element) => {
      return element?.textContent === '質問 2 / 10';
    });
    
    expect(questionText).toBeInTheDocument();
  });

  it('すべての質問に回答すると結果が表示される', async () => {
    render(<Home />);
    await startDiagnosis();
    
    // すべての質問に回答
    for (let i = 0; i < 10; i++) {
      const options = screen.getAllByRole('button').filter(button => 
        !button.textContent?.includes('診断を始める') &&
        !button.textContent?.includes('もう一度テストを受ける') &&
        !button.textContent?.includes('次へ')
      );
      await act(async () => {
        await userEvent.click(options[0]);
      });
      
      // 次へボタンをクリック（最後の質問以外）
      if (i < 9) {
        const nextButton = screen.getByText('次へ');
        await act(async () => {
          await userEvent.click(nextButton);
        });
      }
    }

    // 結果が表示されることを確認
    expect(screen.getByText('あなたの結果')).toBeInTheDocument();
    expect(screen.getByText('あなたへのアドバイス')).toBeInTheDocument();
  });

  it('「もう一度テストを受ける」ボタンをクリックすると最初に戻る', async () => {
    render(<Home />);
    await startDiagnosis();
    
    // すべての質問に回答
    for (let i = 0; i < 10; i++) {
      const options = screen.getAllByRole('button').filter(button => 
        !button.textContent?.includes('診断を始める') &&
        !button.textContent?.includes('もう一度テストを受ける') &&
        !button.textContent?.includes('次へ')
      );
      await act(async () => {
        await userEvent.click(options[0]);
      });
      
      // 次へボタンをクリック（最後の質問以外）
      if (i < 9) {
        const nextButton = screen.getByText('次へ');
        await act(async () => {
          await userEvent.click(nextButton);
        });
      }
    }

    // もう一度テストを受けるボタンをクリック
    const resetButton = screen.getByText('もう一度テストを受ける');
    await act(async () => {
      await userEvent.click(resetButton);
    });

    // 最初の画面が表示されることを確認
    expect(screen.getByText('英語学習スタイル診断')).toBeInTheDocument();
    expect(screen.getByText('診断を始める')).toBeInTheDocument();
  });

  it('進捗バーが正しく更新される', async () => {
    render(<Home />);
    await startDiagnosis();

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '10');

    // 最初の質問に回答
    const firstOption = screen.getByText('単語の意味を他の人に説明しながら覚える');
    await act(async () => {
      await userEvent.click(firstOption);
    });

    // 次へボタンをクリック
    const nextButton = screen.getByText('次へ');
    await act(async () => {
      await userEvent.click(nextButton);
    });

    expect(progressBar).toHaveAttribute('aria-valuenow', '20');
  });

  it('SNSシェアボタンが正しく機能する', async () => {
    mockOpen.mockClear();
    render(<Home />);
    await startDiagnosis();
    
    // すべての質問に回答
    for (let i = 0; i < 10; i++) {
      const options = screen.getAllByRole('button').filter(button => 
        !button.textContent?.includes('診断を始める') &&
        !button.textContent?.includes('もう一度テストを受ける') &&
        !button.textContent?.includes('次へ')
      );
      await act(async () => {
        await userEvent.click(options[0]);
      });
      
      // 次へボタンをクリック（最後の質問以外）
      if (i < 9) {
        const nextButton = screen.getByText('次へ');
        await act(async () => {
          await userEvent.click(nextButton);
        });
      }
    }

    // SNSシェアボタンをクリック
    const twitterButton = screen.getByText('X (Twitter)');
    await userEvent.click(twitterButton);
    
    expect(mockOpen).toHaveBeenCalledTimes(1);
    expect(mockOpen).toHaveBeenCalledWith(expect.stringContaining('twitter.com/intent/tweet'), '_blank');
  });

  it('選択したオプションに正しいスタイルが適用される', async () => {
    render(<Home />);
    await startDiagnosis();

    const firstOption = screen.getByText('単語の意味を他の人に説明しながら覚える');
    await act(async () => {
      await userEvent.click(firstOption);
    });

    expect(firstOption.closest('button')).toHaveClass('selected-option');
  });

  it('renders progress bar with correct accessibility attributes', () => {
    render(<Home />);
    const progressBar = screen.getByRole('progressbar');
    
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    expect(progressBar).toHaveAttribute('aria-valuenow', '10'); // 最初の質問は10%
  });

  it('プログレスバーが適切なアクセシビリティ属性を持っている', () => {
    render(<Home />);
    const progressBar = screen.getByTestId('progress-bar');
    
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('role', 'progressbar');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    expect(progressBar).toHaveAttribute('aria-valuenow');
  });
}); 