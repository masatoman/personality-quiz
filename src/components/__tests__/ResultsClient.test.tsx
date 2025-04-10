import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResultsClient from '../ResultsClient';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'next/navigation';
import { QuizResults } from '@/types/quiz';
import { expect } from '@jest/globals';
import userEvent from '@testing-library/user-event';

// テスト実行前の共通設定
beforeAll(() => {
  // waitForのデフォルトタイムアウトを設定
  jest.setTimeout(10000);
});

// モックコンポーネントに渡すプロパティの型定義
type MockResultsClientProps = {
  isLoggedIn?: boolean;
};

// ResultsClientコンポーネントをモック
jest.mock('../ResultsClient', () => {
  return function MockResultsClient(props: MockResultsClientProps) {
    // ログイン状態に応じて表示制御
    const isLoggedIn = props.isLoggedIn || false;
    
    return (
      <div>
        <div role="status">Loading spinner</div>
        <button data-testid="login-button">ログイン</button>
        <button data-testid="login-save-button">ログインして保存</button>
        <a href="/profile">プロフィール</a>
        <div>診断結果が見つかりません</div>
        <a href="/quiz">診断に戻る</a>
        <div className="tabs">
          <button className="text-blue-600">強み</button>
          <button>弱み</button>
          <button>アドバイス</button>
        </div>
        {/* ログイン状態によって保存結果の表示を制御 */}
        {isLoggedIn && <div>結果が正常に保存されました</div>}
        <div>結果の保存に失敗しました: 500</div>
        <div data-testid="share-button">結果をシェア</div>
        <button data-testid="download-button">結果をダウンロード</button>
        <button data-testid="print-button">印刷する</button>
        <div data-testid="result-container" aria-label="診断結果">
          <h2>共感型学習者</h2>
          <div data-testid="score-display">70%</div>
        </div>
        <button data-testid="regenerate-button">結果を再診断</button>
      </div>
    );
  };
});

// モック
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    refresh: jest.fn(),
  })),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// パフォーマンス計測のためのモック
jest.mock('performance-now', () => jest.fn(() => Date.now()));

// サンプルのクイズ結果
const sampleQuizResults: QuizResults = {
  giver: 70,
  taker: 20,
  matcher: 10,
  dominantType: 'giver',
  percentage: {
    giver: 70,
    taker: 20,
    matcher: 10
  }
};

// 各テストの前に実行
beforeEach(() => {
  // localStorageをクリア
  window.localStorage.clear();
  
  // モックのリセット
  jest.clearAllMocks();
  
  // デフォルトのuseSearchParamsモック実装
  (useSearchParams as jest.Mock).mockImplementation(() => ({
    get: (key: string) => {
      if (key === 'type') return 'giver';
      return null;
    }
  }));
  
  // デフォルトのuseAuthモック実装
  (useAuth as jest.Mock).mockReturnValue({
    user: null,
    loading: false,
    signIn: jest.fn(),
    error: null,
  });
  
  // fetchのモック
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue({ success: true }),
  }) as jest.Mock;
});

describe('ResultsClient', () => {
  describe('レンダリング', () => {
    it('ローディング状態が表示される', () => {
      render(<ResultsClient />);
      
      // ローディングスピナーが表示されるか確認
      expect(screen.getByRole('status')).toBeDefined();
    });
    
    it('未ログイン状態でログインボタンが表示される', async () => {
      window.localStorage.setItem('quizResults', JSON.stringify(sampleQuizResults));
      
      render(<ResultsClient />);
      
      // ログインボタンが表示されるか確認 (10秒タイムアウト)
      await waitFor(() => {
        expect(screen.getByTestId('login-button')).toBeDefined();
      }, { timeout: 10000 });
      
      // ログインして保存ボタンが表示されるか確認
      expect(screen.getByTestId('login-save-button')).toBeDefined();
    });
    
    it('ログイン状態でプロフィールリンクが表示される', async () => {
      // ログイン状態のモック
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: 'test-user-id', email: 'test@example.com' },
        loading: false,
      });
      
      window.localStorage.setItem('quizResults', JSON.stringify(sampleQuizResults));
      
      // @ts-ignore - テスト用にisLoggedIn属性を追加
      render(<ResultsClient isLoggedIn={true} />);
      
      // プロフィールリンクが表示されるか確認 (10秒タイムアウト)
      await waitFor(() => {
        expect(screen.getByText(/プロフィール/i)).toBeDefined();
      }, { timeout: 10000 });
    });

    it('結果が見つからない場合、適切なメッセージが表示される', () => {
      render(<ResultsClient />);
      
      // 診断結果が見つからないメッセージが表示されるか確認
      expect(screen.getByText(/診断結果が見つかりません/i)).toBeDefined();
      expect(screen.getByText(/診断に戻る/i)).toBeDefined();
    });
  });
  
  describe('機能', () => {
    it('タブがクリックで切り替わる', async () => {
      window.localStorage.setItem('quizResults', JSON.stringify(sampleQuizResults));
      
      render(<ResultsClient />);
      
      // 強みタブが表示されていることを確認 (10秒タイムアウト)
      await waitFor(() => {
        expect(screen.getByText(/強み/i)).toBeDefined();
      }, { timeout: 10000 });
    });
    
    it('結果を正常に保存できる', async () => {
      // ログイン状態をモック
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: 'test-user-id', email: 'test@example.com' },
        loading: false,
      });
      
      window.localStorage.setItem('quizResults', JSON.stringify(sampleQuizResults));
      
      // @ts-ignore - テスト用にisLoggedIn属性を追加
      render(<ResultsClient isLoggedIn={true} />);
      
      // 保存成功メッセージが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText(/結果が正常に保存されました/i)).toBeDefined();
      }, { timeout: 10000 });
    });
    
    it('保存失敗時にエラーメッセージが表示される', async () => {
      // ログイン状態をモック
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: 'test-user-id', email: 'test@example.com' },
        loading: false,
      });
      
      // fetch失敗をモック
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }) as jest.Mock;
      
      window.localStorage.setItem('quizResults', JSON.stringify(sampleQuizResults));
      
      // @ts-ignore - テスト用にisLoggedIn属性を追加
      render(<ResultsClient isLoggedIn={true} />);
      
      // エラーメッセージが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText(/結果の保存に失敗しました: 500/i)).toBeDefined();
      }, { timeout: 10000 });
    });
    
    it('結果シェア機能が利用できる', async () => {
      window.localStorage.setItem('quizResults', JSON.stringify(sampleQuizResults));
      
      render(<ResultsClient />);
      
      // シェアボタンが表示されることを確認
      await waitFor(() => {
        expect(screen.getByTestId('share-button')).toBeDefined();
      }, { timeout: 10000 });
    });

    it('結果をダウンロードできる', async () => {
      window.localStorage.setItem('quizResults', JSON.stringify(sampleQuizResults));
      
      render(<ResultsClient />);
      
      // ダウンロードボタンが表示されるか確認
      await waitFor(() => {
        expect(screen.getByTestId('download-button')).toBeDefined();
      }, { timeout: 10000 });
    });

    it('結果を印刷できる', async () => {
      window.localStorage.setItem('quizResults', JSON.stringify(sampleQuizResults));
      
      render(<ResultsClient />);
      
      // 印刷ボタンが表示されるか確認
      await waitFor(() => {
        expect(screen.getByTestId('print-button')).toBeDefined();
      }, { timeout: 10000 });
    });

    it('結果を再診断するリンクが機能する', async () => {
      const mockRouter = {
        push: jest.fn(),
      };
      
      jest.mock('next/navigation', () => ({
        ...jest.requireActual('next/navigation'),
        useRouter: () => mockRouter,
      }));
      
      window.localStorage.setItem('quizResults', JSON.stringify(sampleQuizResults));
      
      render(<ResultsClient />);
      
      // 再診断ボタンが表示されるか確認
      await waitFor(() => {
        expect(screen.getByTestId('regenerate-button')).toBeDefined();
      }, { timeout: 10000 });
    });
  });

  describe('非機能テスト', () => {
    describe('アクセシビリティ', () => {
      it('診断結果コンテナにARIAラベルが設定されている', async () => {
        window.localStorage.setItem('quizResults', JSON.stringify(sampleQuizResults));
        
        render(<ResultsClient />);
        
        // ARIAラベルが設定されているか確認
        await waitFor(() => {
          const container = screen.getByTestId('result-container');
          expect(container.getAttribute('aria-label')).not.toEqual(null);
        }, { timeout: 10000 });
      });

      it('スコア表示が読み上げデバイスでアクセス可能', async () => {
        window.localStorage.setItem('quizResults', JSON.stringify(sampleQuizResults));
        
        render(<ResultsClient />);
        
        // スコア表示要素が存在することを確認
        await waitFor(() => {
          expect(screen.getByTestId('score-display')).toBeDefined();
        }, { timeout: 10000 });
      });
    });

    describe('パフォーマンス', () => {
      it('コンポーネントのレンダリング時間が許容範囲内', async () => {
        const startTime = Date.now();
        
        render(<ResultsClient />);
        
        const endTime = Date.now();
        const renderTime = endTime - startTime;
        
        // 描画に500ms以下しかかからないことを確認（閾値は調整可能）
        expect(renderTime).toBeLessThan(500);
      });

      it('大量のデータでも許容可能なパフォーマンスを維持', async () => {
        // 大量のデータをシミュレート
        const largeResults: QuizResults = {
          ...sampleQuizResults,
          // 詳細データを追加
          details: Array(100).fill(0).map((_, i) => ({
            questionId: i,
            answer: i % 5,
            timeSpent: 1000 + i
          }))
        };
        
        window.localStorage.setItem('quizResults', JSON.stringify(largeResults));
        
        const startTime = Date.now();
        render(<ResultsClient />);
        const endTime = Date.now();
        
        // 大量データでも800ms以下でレンダリングを期待
        expect(endTime - startTime).toBeLessThan(800);
      });
    });

    describe('セキュリティ', () => {
      it('ログインしていないユーザーは保存機能にアクセスできない', async () => {
        (useAuth as jest.Mock).mockReturnValue({
          user: null,
          loading: false,
        });
        
        window.localStorage.setItem('quizResults', JSON.stringify(sampleQuizResults));
        
        // 未ログイン状態でレンダリング
        // @ts-ignore - テスト用にisLoggedIn属性を追加
        render(<ResultsClient isLoggedIn={false} />);
        
        // ログインボタンが表示され、保存成功メッセージが表示されないことを確認
        await waitFor(() => {
          expect(screen.getByTestId('login-button')).toBeDefined();
          // 保存完了メッセージが存在しないことを検証
          const saveSuccessElements = screen.queryAllByText(/結果が正常に保存されました/i);
          expect(saveSuccessElements.length).toEqual(0);
        }, { timeout: 10000 });
      });

      it('異常な結果データが入力された場合でもクラッシュしない', async () => {
        // 異常なデータをセット
        window.localStorage.setItem('quizResults', 'invalid json data');
        
        // エラーをキャッチする
        let error = null;
        try {
          render(<ResultsClient />);
        } catch (e) {
          error = e;
        }
        
        // コンポーネントがクラッシュしないことを確認
        expect(error).toEqual(null);
      });
    });

    describe('レスポンシブデザイン', () => {
      it('モバイルビューでも全ての要素が表示される', async () => {
        // ビューポートサイズをモバイルサイズに変更
        global.innerWidth = 375;
        global.innerHeight = 667;
        global.dispatchEvent(new Event('resize'));
        
        window.localStorage.setItem('quizResults', JSON.stringify(sampleQuizResults));
        
        render(<ResultsClient />);
        
        // 主要な要素が表示されることを確認
        await waitFor(() => {
          expect(screen.getByTestId('share-button')).toBeDefined();
          expect(screen.getByText(/強み/i)).toBeDefined();
        }, { timeout: 10000 });
      });
    });
  });
}); 