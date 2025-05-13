import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GiverScoreChart from '@/components/dashboard/GiverScoreChart';

// Supabase呼び出しのモック
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
  }
}));

describe('GiverScoreChart Component', () => {
  const mockUserId = 'test-user-123';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ローディング状態が正しく表示されること', () => {
    // Supabaseがすぐには解決しないようにモック
    const { supabase } = require('@/lib/supabase');
    supabase.from().select().eq().gte().lte().order.mockImplementation(() => {
      return new Promise(() => {});
    });
    
    render(<GiverScoreChart userId={mockUserId} />);
    
    // ローディングインジケータが表示されていることを確認
    const loadingElement = screen.getByText(/読み込み中/i);
    expect(loadingElement).toBeInTheDocument();
  });

  it('データが正しく表示されること', async () => {
    // 成功するSupabaseのレスポンスをモック
    const mockData = [
      { user_id: mockUserId, created_at: '2023-01-01', score: 65 },
      { user_id: mockUserId, created_at: '2023-01-15', score: 70 },
      { user_id: mockUserId, created_at: '2023-01-30', score: 75 }
    ];
    
    const { supabase } = require('@/lib/supabase');
    supabase.from().select().eq().gte().lte().order.mockResolvedValue({
      data: mockData,
      error: null
    });
    
    render(<GiverScoreChart userId={mockUserId} />);
    
    // ローディングが終わるまで待機
    await waitFor(() => {
      expect(screen.queryByText(/読み込み中/i)).not.toBeInTheDocument();
    });
    
    // タイトルが表示されていることを確認
    expect(screen.getByText(/ギバースコア推移/i)).toBeInTheDocument();
  });

  it('期間切り替えボタンが正しく機能すること', async () => {
    const mockData = [
      { user_id: mockUserId, created_at: '2023-01-01', score: 65 }
    ];
    
    const { supabase } = require('@/lib/supabase');
    supabase.from().select().eq().gte().lte().order.mockResolvedValue({
      data: mockData,
      error: null
    });
    
    render(<GiverScoreChart userId={mockUserId} />);
    
    // 1週間ボタンをクリック
    fireEvent.click(screen.getByText('1週間'));
    
    // Supabaseが再度呼び出されたことを確認
    expect(supabase.from).toHaveBeenCalledTimes(2);
  });
}); 