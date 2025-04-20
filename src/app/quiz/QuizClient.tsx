import React, { useState, useEffect, useCallback } from 'react';
import { Question, Answer } from '@/types/quiz';
import { useRouter } from 'next/navigation';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import QuestionCard from '@/components/QuestionCard';
import QuizIntro from '@/components/QuizIntro';

export const QuizClient = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const router = useRouter();
  const { handleError } = useErrorHandler();

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/questions');
      if (!response.ok) {
        throw new Error('質問の取得に失敗しました');
      }
      const data = await response.json();
      setQuestions(data.questions);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('不明なエラーが発生しました');
      setError(error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchQuestions();
  }, []);

  const handleAnswer = async (answer: Answer) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      try {
        const response = await fetch('/api/calculate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ answers: newAnswers }),
        });

        if (!response.ok) {
          throw new Error('結果の計算に失敗しました');
        }

        const data = await response.json();
        void router.push(`/result/${data.type}`);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('不明なエラーが発生しました');
        setError(error);
        handleError(error);
      }
    }
  };

  const startQuiz = () => {
    setShowIntro(false);
  };

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">エラーが発生しました: {error.message}</p>
      </div>
    );
  }

  if (loading && !showIntro) {
    return (
      <div className="text-center p-4">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (showIntro) {
    return <QuizIntro onStart={startQuiz} />;
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <QuestionCard
          question={questions[currentQuestionIndex]}
          onAnswer={handleAnswer}
          totalQuestions={questions.length}
          currentQuestion={currentQuestionIndex + 1}
        />
      </div>
    </ErrorBoundary>
  );
};

export default QuizClient; 