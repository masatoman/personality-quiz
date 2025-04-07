import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionCard } from '../QuestionCard';

// モックデータ
const mockQuestion = {
  id: 1,
  text: '英語の勉強会で、あなたはどのように参加しますか？',
  options: [
    {
      text: '他の参加者の学習をサポートしながら自分も学ぶ',
      score: { giver: 2, taker: 0, matcher: 1 }
    },
    {
      text: '自分の学習に集中して、効率よく進める',
      score: { giver: 0, taker: 2, matcher: 1 }
    },
    {
      text: 'お互いに教え合いながら進める',
      score: { giver: 1, taker: 0, matcher: 2 }
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
    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar).toHaveStyle({ width: '10%' });
  });

  it('オプションをクリックするとonAnswerが呼ばれる', () => {
    render(<QuestionCard {...defaultProps} />);
    
    // 最初のオプションをクリック
    fireEvent.click(screen.getByText(mockQuestion.options[0].text));
    expect(mockOnAnswer).toHaveBeenCalledWith(0);

    // 2番目のオプションをクリック
    fireEvent.click(screen.getByText(mockQuestion.options[1].text));
    expect(mockOnAnswer).toHaveBeenCalledWith(1);
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
    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar).toHaveStyle({ width: '100%' });
  });
}); 