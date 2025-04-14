import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDashboardData } from '@/lib/supabase/dashboard';
import { GET } from '../route';

// モック
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/supabase/dashboard');

describe('Dashboard API', () => {
  const mockUserId = 'test-user-id';
  const mockDashboardData = {
    summary: {
      createdMaterials: 5,
      earnedPoints: 1200,
      viewedMaterials: 15
    },
    giverScores: [
      { date: '2024-03-01', score: 65 },
      { date: '2024-03-02', score: 70 }
    ],
    activityDistribution: [
      { type: '教材作成', percentage: 35 },
      { type: '教材閲覧', percentage: 25 }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue({});
    (getDashboardData as jest.Mock).mockResolvedValue(mockDashboardData);
  });

  it('正常なリクエストで200とデータを返す', async () => {
    const request = new Request(`http://localhost/api/dashboard?userId=${mockUserId}`);
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ data: mockDashboardData });
    expect(createClient).toHaveBeenCalled();
    expect(getDashboardData).toHaveBeenCalledWith({}, mockUserId);
  });

  it('userIdがない場合は400エラーを返す', async () => {
    const request = new Request('http://localhost/api/dashboard');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'ユーザーIDが必要です' });
  });

  it('データ取得でエラーが発生した場合は500エラーを返す', async () => {
    (getDashboardData as jest.Mock).mockRejectedValue(new Error('テストエラー'));
    
    const request = new Request(`http://localhost/api/dashboard?userId=${mockUserId}`);
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'ダッシュボードデータの取得に失敗しました' });
  });
}); 