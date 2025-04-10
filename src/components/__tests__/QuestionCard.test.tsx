import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionCard } from '../QuestionCard';

// モックデータ
const mockQuestion = {
  id: 1,
  text: '英語の授業で新しい単語を覚えるとき、どの方法が最も自然に感じますか？',
  options: [
    {
      text: '単語の意味を他の人に説明しながら覚える',
      score: { giver: 3, taker: 0, matcher: 1 }
    },
    {
      text: '自分だけのオリジナルの例文を作って覚える',
      score: { giver: 0, taker: 3, matcher: 1 }
    },
    {
      text: '友達と例文を出し合って覚える',
      score: { giver: 1, taker: 1, matcher: 3 }
    }
  ]
};

describe('QuestionCard', () => {
  const mockOnAnswer = jest.fn();
  const defaultProps = {
    question: mockQuestion,
    currentQuestion: 0,
    totalQuestions: 10,
    onAnswer: mockOnAnswer,
    selectedOption: null,
  };

  beforeEach(() => {
    mockOnAnswer.mockClear();
  });

  it('質問文とオプションが正しく表示される', () => {
    render(<QuestionCard {...defaultProps} />);
    
    // 質問文の確認
    expect(screen.getByText(mockQuestion.text)).toBeInTheDocument();
    
    // 選択肢の確認
    mockQuestion.options.forEach((option) => {
      expect(screen.getByText(option.text)).toBeInTheDocument();
    });
  });

  it('進捗状況が正しく表示される', () => {
    render(<QuestionCard {...defaultProps} />);
    
    expect(screen.getByText('質問 1 / 10')).toBeInTheDocument();
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '10');
  });

  it('オプションをクリックするとonAnswerが呼ばれる', () => {
    render(<QuestionCard {...defaultProps} />);
    
    // 最初のオプションをクリック
    fireEvent.click(screen.getByText(mockQuestion.options[0].text));
    expect(mockOnAnswer).toHaveBeenCalledWith(0);
  });

  it('選択されたオプションに正しいスタイルが適用される', () => {
    render(
      <QuestionCard
        {...defaultProps}
        selectedOption={1}
      />
    );
    
    const selectedButton = screen.getByText(mockQuestion.options[1].text);
    expect(selectedButton.closest('button')).toHaveClass('selected-option');
  });

  it('最後の質問で正しい進捗状況が表示される', () => {
    render(
      <QuestionCard
        {...defaultProps}
        currentQuestion={9}
        totalQuestions={10}
      />
    );
    
    expect(screen.getByText('質問 10 / 10')).toBeInTheDocument();
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
  });

  it('プログレスバーの色が正しく適用される', () => {
    render(<QuestionCard {...defaultProps} />);
    
    const progressBarFill = screen.getByRole('progressbar');
    expect(progressBarFill).toHaveClass('bg-primary');
  });
}); 