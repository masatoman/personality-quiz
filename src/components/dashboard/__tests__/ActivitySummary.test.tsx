import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActivitySummary from '../ActivitySummary';

// モックを設定してframer-motionのアニメーションによるエラーを回避
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('ActivitySummary', () => {
  const defaultProps = {
    createdMaterials: 5,
    earnedPoints: 1200,
    viewedMaterials: 15
  };

  it('正しく全ての活動データが表示される', () => {
    render(<ActivitySummary {...defaultProps} />);

    // 各メトリクスのラベルが表示されていることを確認
    expect(screen.getByText('作成した教材')).toBeInTheDocument();
    expect(screen.getByText('獲得ポイント')).toBeInTheDocument();
    expect(screen.getByText('閲覧した教材')).toBeInTheDocument();

    // 各メトリクスの値が表示されていることを確認
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('1200')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('値が0の場合も正しく表示される', () => {
    const zeroProps = {
      createdMaterials: 0,
      earnedPoints: 0,
      viewedMaterials: 0
    };
    
    render(<ActivitySummary {...zeroProps} />);

    // 全ての0が表示されていることを確認
    const zeros = screen.getAllByText('0');
    expect(zeros).toHaveLength(3);
  });

  it('アイコンが正しく表示される', () => {
    render(<ActivitySummary {...defaultProps} />);

    // アイコンの存在を確認（クラス名で検証）
    expect(document.querySelector('.text-blue-500')).toBeInTheDocument();
    expect(document.querySelector('.text-yellow-500')).toBeInTheDocument();
    expect(document.querySelector('.text-green-500')).toBeInTheDocument();
  });
}); 