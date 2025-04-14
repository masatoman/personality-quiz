import React from 'react';
import { render, screen } from '@testing-library/react';
import GiverScoreDisplay from '@/components/features/giver-score/GiverScoreDisplay';
import { calculateGiverLevel } from '@/utils/score';

/**
 * GiverScoreDisplayコンポーネントの単体テスト
 * テスト対象: ギバースコア表示コンポーネントの機能と表示
 */
describe('GiverScoreDisplay コンポーネント', () => {
  const mockUserData = {
    id: 'user123',
    name: 'テストユーザー',
    email: 'test@example.com',
    score: 350,
    activities: 25,
    level: 4,
    nextLevelScore: 500,
    progressPercentage: 70,
    personalityType: 'giver' as const,
    learningStreak: 7,
    contributionStats: {
      createdContent: 5,
      providedFeedback: 15,
      helpedUsers: 10
    }
  };

  it('ギバースコアが正しく表示される', () => {
    render(<GiverScoreDisplay userData={mockUserData} />);
    
    // スコアが表示されている
    expect(screen.getByText(/350/)).toBeInTheDocument();
    
    // レベルが表示されている
    expect(screen.getByText(/レベル 4/)).toBeInTheDocument();
  });

  it('プログレスバーが正しい進捗率を示している', () => {
    render(<GiverScoreDisplay userData={mockUserData} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '70');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('次のレベルまでの必要スコアが表示される', () => {
    render(<GiverScoreDisplay userData={mockUserData} />);
    
    // 次のレベルまでの情報が表示されている
    expect(screen.getByText(/次のレベルまで: 150ポイント/)).toBeInTheDocument();
  });

  it('異なるスコアでレベルが正しく計算される', () => {
    // スコアサンプルとそれに対応する期待されるレベル
    const sampleScores = [0, 50, 150, 350, 950, 2000];
    const expectedLevels = [1, 1, 2, 4, 10, 10];
    
    // 各スコアに対してレベルを検証
    sampleScores.forEach((score, index) => {
      const level = calculateGiverLevel(score);
      expect(level).toBe(expectedLevels[index]);
    });
  });

  it('パーソナリティタイプに応じたアイコンが表示される', () => {
    render(<GiverScoreDisplay userData={mockUserData} />);
    
    // ギバータイプのアイコンを検証
    const giverIcon = screen.getByTestId('giver-icon');
    expect(giverIcon).toBeInTheDocument();
  });

  it('活動回数が表示される', () => {
    render(<GiverScoreDisplay userData={mockUserData} />);
    
    // 活動回数の表示を検証
    expect(screen.getByText(/25 活動/)).toBeInTheDocument();
  });

  it('レベルに応じた特典情報が表示される', () => {
    render(<GiverScoreDisplay userData={mockUserData} />);
    
    // レベル4の特典情報
    expect(screen.getByText(/特典:/)).toBeInTheDocument();
    expect(screen.getByText(/教材作成機能のロック解除/)).toBeInTheDocument();
  });

  it('学習ストリークが表示される', () => {
    render(<GiverScoreDisplay userData={mockUserData} />);
    expect(screen.getByText(/7日連続学習中！/)).toBeInTheDocument();
  });

  describe('貢献統計の表示', () => {
    it('作成教材数が表示される', () => {
      render(<GiverScoreDisplay userData={mockUserData} />);
      const contentCount = screen.getByText('5');
      expect(contentCount).toBeInTheDocument();
      expect(screen.getByText('作成教材')).toBeInTheDocument();
    });

    it('フィードバック数が表示される', () => {
      render(<GiverScoreDisplay userData={mockUserData} />);
      const feedbackCount = screen.getByText('15');
      expect(feedbackCount).toBeInTheDocument();
      expect(screen.getByText('フィードバック')).toBeInTheDocument();
    });

    it('支援ユーザー数が表示される', () => {
      render(<GiverScoreDisplay userData={mockUserData} />);
      const helpedUsersCount = screen.getByText('10');
      expect(helpedUsersCount).toBeInTheDocument();
      expect(screen.getByText('支援ユーザー')).toBeInTheDocument();
    });
  });

  it('アクセシビリティ要素が正しく設定されている', () => {
    render(<GiverScoreDisplay userData={mockUserData} />);
    
    // スクリーンリーダー用のステータス表示をチェック
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent(
      `現在のスコアは${mockUserData.score}ポイントです。レベル${mockUserData.level}で、次のレベルまで${mockUserData.nextLevelScore - mockUserData.score}ポイント必要です。`
    );
  });

  it('アニメーション用のスタイルが正しく適用されている', () => {
    render(<GiverScoreDisplay userData={mockUserData} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle(`width: ${mockUserData.progressPercentage}%`);
  });
}); 