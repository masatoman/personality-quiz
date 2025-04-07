import type { Meta, StoryObj } from '@storybook/react';
import { QuestionCard } from '../components/QuestionCard';

const meta = {
  title: 'Components/QuestionCard',
  component: QuestionCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof QuestionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    question: {
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
    },
    currentQuestion: 0,
    totalQuestions: 10,
    onAnswer: (index) => {
      console.log('Selected option:', index);
    },
  },
};

export const LastQuestion: Story = {
  args: {
    ...Default.args,
    currentQuestion: 9,
    totalQuestions: 10,
  },
}; 