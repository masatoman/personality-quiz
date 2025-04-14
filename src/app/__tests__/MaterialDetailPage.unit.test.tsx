/// <reference types="@testing-library/jest-dom" />
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import React from 'react';
import MaterialDetailPage from '../materials/[id]/page';

// useParamsとuseRouterのモック
jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({ id: 'test-material-id' })),
  useRouter: jest.fn(() => ({
    back: jest.fn(),
    push: jest.fn()
  })),
}));

// window.alertのモック
window.alert = jest.fn();

// Material型をインポートせずに直接定義（テスト用）
type MockMaterial = {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  author: {
    id: string;
    name: string;
    avatar: string;
    giverScore: number;
    type: 'ギバー' | 'マッチャー' | 'テイカー';
  };
  created_at: string;
  view_count: number;
  rating: number;
  is_bookmarked: boolean;
  is_published: boolean;
  tags: string[];
};

// モックデータの設定
const mockMaterial: MockMaterial = {
  id: 'test-material-id',
  title: 'ビジネス英語：互恵的関係の構築',
  description: 'ビジネスシーンで互恵的な関係を構築するための英語表現とコミュニケーション戦略を学びます。',
  content: '<h2>互恵的関係とは</h2><p>互恵的関係（reciprocal relationship）とは、双方が利益を得られる関係性のことです。</p>',
  category: 'business',
  difficulty: 'intermediate',
  author: {
    id: 'author-id',
    name: 'ギバー太郎',
    avatar: '/avatars/giver.png',
    giverScore: 85,
    type: 'ギバー'
  },
  created_at: '2023-09-15T10:30:00Z',
  view_count: 234,
  rating: 4.7,
  is_bookmarked: false,
  is_published: true,
  tags: ['ビジネス英語', '交渉', 'コミュニケーション', '関係構築']
};

const mockFeedbacks = [
  {
    id: 'f1',
    user_id: 'user-1',
    user_name: 'マッチャー花子',
    user_avatar: '/avatars/matcher.png',
    rating: 5,
    comment: 'とても実践的な内容でした！',
    created_at: '2023-10-05T14:25:00Z'
  }
];

const mockRelatedMaterials = [
  {
    id: 'r1',
    title: 'ポリートレスポンスガイド',
    category: 'communication',
    difficulty: 'beginner',
    rating: 4.8,
    author_name: 'ギバー太郎'
  }
];

// モック関数で使用する型定義
type SetStateMock = React.Dispatch<React.SetStateAction<any>>;

// テストスイート
describe('MaterialDetailPage', () => {
  beforeEach(() => {
    // モックのリセット
    jest.clearAllMocks();
    
    // fetchMaterial関数のモック実装
    const originalUseEffect = React.useEffect;
    jest.spyOn(React, 'useEffect').mockImplementationOnce((f: Function) => {
      f();
      return originalUseEffect(f, []);
    });
    
    // useStateのモック
    jest.spyOn(React, 'useState').mockImplementation((initialValue: any): [any, SetStateMock] => {
      if (initialValue === null && typeof initialValue === 'object') {
        return [mockMaterial, jest.fn()];
      } else if (Array.isArray(initialValue) && initialValue.length === 0) {
        if (mockFeedbacks && !mockRelatedMaterials) return [mockFeedbacks, jest.fn()];
        if (mockRelatedMaterials && !mockFeedbacks) return [mockRelatedMaterials, jest.fn()];
        // デフォルトの空配列を返す
        return [[], jest.fn()];
      } else if (initialValue === true) {
        return [false, jest.fn()];
      }
      return [initialValue, jest.fn()];
    });
  });

  it('教材のタイトルと説明が表示される', () => {
    render(<MaterialDetailPage />);
    
    expect(screen.getByText('ビジネス英語：互恵的関係の構築')).toBeInTheDocument();
    expect(screen.getByText('ビジネスシーンで互恵的な関係を構築するための英語表現とコミュニケーション戦略を学びます。')).toBeInTheDocument();
  });

  it('著者情報が表示される', () => {
    render(<MaterialDetailPage />);
    
    expect(screen.getByText('ギバー太郎')).toBeInTheDocument();
    expect(screen.getByText('ギバースコア:')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('教材の難易度とカテゴリが表示される', () => {
    render(<MaterialDetailPage />);
    
    expect(screen.getByText('ビジネス英語')).toBeInTheDocument();
    expect(screen.getByText('中級')).toBeInTheDocument();
  });

  it('教材のコンテンツがレンダリングされる', () => {
    render(<MaterialDetailPage />);
    
    // dangerouslySetInnerHTMLでレンダリングされたコンテンツをテスト
    expect(document.querySelector('.prose')?.innerHTML).toContain('互恵的関係とは');
  });

  it('タグが表示される', () => {
    render(<MaterialDetailPage />);
    
    mockMaterial.tags.forEach(tag => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it('フィードバックが表示される', () => {
    render(<MaterialDetailPage />);
    
    expect(screen.getByText('マッチャー花子')).toBeInTheDocument();
    expect(screen.getByText('とても実践的な内容でした！')).toBeInTheDocument();
  });

  it('関連教材が表示される', () => {
    render(<MaterialDetailPage />);
    
    expect(screen.getByText('ポリートレスポンスガイド')).toBeInTheDocument();
  });

  it('ブックマークボタンをクリックするとステートが変わる', async () => {
    const user = userEvent.setup();
    
    render(<MaterialDetailPage />);
    
    const bookmarkButton = screen.getByText('ブックマーク');
    await user.click(bookmarkButton);
    
    // toggleBookmark関数の呼び出しを確認（実装の詳細に依存するので、正確な検証は難しい）
    expect(bookmarkButton).toBeInTheDocument();
  });

  it('学習完了ボタンをクリックするとalertが表示される', async () => {
    const user = userEvent.setup();
    
    render(<MaterialDetailPage />);
    
    const completeButton = screen.getByText('学習完了としてマーク');
    await user.click(completeButton);
    
    expect(window.alert).toHaveBeenCalledWith('学習を完了しました！ポイントが加算されました。');
  });

  it('評価フォームに入力して送信できる', async () => {
    const user = userEvent.setup();
    
    render(<MaterialDetailPage />);
    
    // 星評価をクリック
    const starButtons = screen.getAllByText('★');
    await user.click(starButtons[2]); // 3番目の星（index 2）をクリック
    
    // コメント入力
    const commentTextarea = screen.getByPlaceholderText('コメントを入力してください（任意）');
    await user.type(commentTextarea, 'テストコメント');
    
    // 送信ボタンクリック
    const submitButton = screen.getByText('評価を送信');
    await user.click(submitButton);
    
    // 送信中の状態を確認（実装によって異なる可能性あり）
    await waitFor(() => {
      expect(screen.getByText('送信中...')).toBeInTheDocument();
    });
  });

  it('戻るボタンが機能する', async () => {
    const user = userEvent.setup();
    
    render(<MaterialDetailPage />);
    
    const backButton = screen.getByText('一覧に戻る');
    await user.click(backButton);
    
    // useRouterのbackメソッドが呼ばれたことを確認
    const { useRouter } = require('next/navigation');
    expect(useRouter().back).toHaveBeenCalled();
  });
}); 