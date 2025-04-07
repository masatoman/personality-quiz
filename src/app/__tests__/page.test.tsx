import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../page';

describe('Home', () => {
  it('最初の質問が表示される', () => {
    render(<Home />);
    expect(screen.getByText('質問 1 / 10')).toBeInTheDocument();
    expect(screen.getByText('新しいプロジェクトでチームを組む際、あなたはどのように行動しますか？')).toBeInTheDocument();
  });

  it('質問に回答すると次の質問に進む', async () => {
    render(<Home />);
    const firstOption = screen.getByText('チームメンバーの成功を支援することに喜びを感じる');
    await userEvent.click(firstOption);
    expect(screen.getByText('質問 2 / 10')).toBeInTheDocument();
  });

  it('すべての質問に回答すると結果が表示される', async () => {
    render(<Home />);
    
    // すべての質問に回答
    for (let i = 0; i < 10; i++) {
      const options = screen.getAllByRole('button');
      await userEvent.click(options[0]);
    }

    // 結果が表示されることを確認
    expect(screen.getByText('あなたの結果')).toBeInTheDocument();
    expect(screen.getByText('長所')).toBeInTheDocument();
    expect(screen.getByText('短所')).toBeInTheDocument();
  });

  it('「もう一度テストを受ける」ボタンをクリックすると最初に戻る', async () => {
    render(<Home />);
    
    // すべての質問に回答
    for (let i = 0; i < 10; i++) {
      const options = screen.getAllByRole('button');
      await userEvent.click(options[0]);
    }

    // もう一度テストを受けるボタンをクリック
    const resetButton = screen.getByText('もう一度テストを受ける');
    await userEvent.click(resetButton);

    // 最初の質問が表示されることを確認
    expect(screen.getByText('質問 1 / 10')).toBeInTheDocument();
  });

  it('進捗バーが正しく更新される', async () => {
    render(<Home />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({ width: '10%' });

    // 質問に回答
    const firstOption = screen.getByText('チームメンバーの成功を支援することに喜びを感じる');
    await userEvent.click(firstOption);
    expect(progressBar).toHaveStyle({ width: '20%' });
  });
}); 