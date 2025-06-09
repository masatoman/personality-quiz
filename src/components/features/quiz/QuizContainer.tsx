'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Button, Box, CircularProgress } from '@mui/material';
import { questions } from '@/data/questions';
import { QuizForm } from './QuizForm';
import { QuizResults } from './QuizResults';
import { Answer, QuizQuestion, QuizResults as QuizResultsType, QuizState, PersonalityType } from './types';
import { AnimatePresence } from 'framer-motion';
import { PlayArrow, AutoAwesome, FactCheck } from '@mui/icons-material';
import { useSearchParams, useRouter } from 'next/navigation';
import { getClient } from '@/lib/supabase/client';

// 簡易診断用の質問（オリジナルの質問から重要な5問を選択）
const quickQuestions = [1, 3, 5, 7, 9].map(id => 
  questions.find(q => q.id === id)
).filter(q => q !== undefined) as QuizQuestion[];

export const QuizContainer: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = getClient();
  const startParam = searchParams.get('start');
  const quickParam = searchParams.get('quick');
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizState, setQuizState] = useState<QuizState>(
    startParam === 'true' ? 'questioning' : 'intro'
  );
  const [results, setResults] = useState<QuizResultsType | null>(null);
  const [isQuickMode, setIsQuickMode] = useState(quickParam === 'true');
  const [recommendedMaterials, setRecommendedMaterials] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // ログイン状態をチェック
  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session?.user);
    };
    
    checkAuthStatus();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // 質問データをチェック：簡易モードかフルモードかで使用する質問を切り替え
  const questionsData = isQuickMode 
    ? quickQuestions 
    : (Array.isArray(questions) ? (questions as unknown as QuizQuestion[]) : []);
  
  const currentQuestion = questionsData[currentQuestionIndex];
  const progress = questionsData.length > 0
    ? ((currentQuestionIndex + 1) / questionsData.length) * 100
    : 0;

  // 前の回答があれば選択状態を復元
  useEffect(() => {
    if (!currentQuestion) return;
    const existingAnswer = answers.find(a => a.questionId === currentQuestion.id);
    if (existingAnswer) {
      setSelectedOption(existingAnswer.selectedOption);
    } else {
      setSelectedOption(null);
    }
  }, [currentQuestionIndex, answers, currentQuestion]);

  // オプション選択時の処理
  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };

  // 前の質問に戻る
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // 次の質問へ進む
  const handleNext = () => {
    if (selectedOption === null || !currentQuestion) return;

    // 現在の回答を保存/更新
    const newAnswers = [...answers];
    const existingAnswerIndex = newAnswers.findIndex(a => a.questionId === currentQuestion.id);

    if (existingAnswerIndex >= 0) {
      newAnswers[existingAnswerIndex].selectedOption = selectedOption;
    } else {
      newAnswers.push({
        questionId: currentQuestion.id,
        selectedOption: selectedOption
      });
    }

    setAnswers(newAnswers);

    // 次の質問へ進むか、最後なら結果計算
    if (currentQuestionIndex < questionsData.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateResults(newAnswers);
    }
  };

  // 結果計算
  const calculateResults = (finalAnswers: Answer[]) => {
    let giverScore = 0;
    let takerScore = 0;
    let matcherScore = 0;

    finalAnswers.forEach(answer => {
      const question = questionsData.find(q => q.id === answer.questionId);
      if (question && question.options && question.options[answer.selectedOption]) {
        const option = question.options[answer.selectedOption];
        giverScore += option.score.giver;
        takerScore += option.score.taker;
        matcherScore += option.score.matcher;
      }
    });

    const total = giverScore + takerScore + matcherScore;
    let dominantType: PersonalityType = 'matcher';

    if (giverScore >= takerScore && giverScore >= matcherScore) {
      dominantType = 'giver';
    } else if (takerScore >= giverScore && takerScore >= matcherScore) {
      dominantType = 'taker';
    }

    const results: QuizResultsType = {
      giver: giverScore,
      taker: takerScore,
      matcher: matcherScore,
      dominantType,
      percentage: {
        giver: Math.round((giverScore / total) * 100),
        taker: Math.round((takerScore / total) * 100),
        matcher: Math.round((matcherScore / total) * 100)
      }
    };

    setResults(results);
    setQuizState('loading');
    saveResults(results);
    // 教材推薦を取得
    fetchRecommendedMaterials(dominantType);
  };

  // 教材推薦データの取得
  const fetchRecommendedMaterials = async (personalityType: PersonalityType) => {
    try {
      // パーソナリティタイプに基づいた実用的な教材推薦
      const materials = [
        {
          id: 1,
          title: personalityType === 'giver' 
            ? '他者に効果的に教える英会話テクニック' 
            : personalityType === 'taker' 
              ? '自己学習のための効率的な単語記憶法'
              : 'グループディスカッションでの英語表現',
          duration: '5分',
          level: '初級',
          description: personalityType === 'giver'
            ? '教えることで学ぶ効果を最大化する方法を学べます。'
            : personalityType === 'taker'
              ? '効率的な個人学習のテクニックを身につけられます。'
              : 'バランスの取れた学習アプローチを習得できます。'
        },
        {
          id: 2,
          title: personalityType === 'giver'
            ? '初心者への説明が上手くなる英語表現集'
            : personalityType === 'taker'
              ? '個人学習者向け英語ニュースサイトの活用法'
              : '英語学習コミュニティでの効果的な参加方法',
          duration: '3分',
          level: '初中級',
          description: personalityType === 'giver'
            ? '分かりやすい説明スキルを向上させる表現を学べます。'
            : personalityType === 'taker'
              ? '一人でも効果的に学習を進める方法を習得できます。'
              : 'コミュニティを活用した学習方法を身につけられます。'
        }
      ];
      
      setRecommendedMaterials(materials);
    } catch (error) {
      console.error('教材推薦の取得中にエラーが発生しました:', error);
      setRecommendedMaterials([]);
    }
  };

  // 結果の保存
  const saveResults = async (results: QuizResultsType) => {
    try {
      const response = await fetch('/api/quiz/save-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...results,
          isQuickMode // 簡易診断かどうかを送信
        }),
      });

      if (!response.ok) {
        throw new Error(`結果の保存に失敗しました: ${response.status}`);
      }

      setQuizState('completed');
      localStorage.setItem('quizResults', JSON.stringify(results));
    } catch (error) {
      console.error('結果の保存中にエラーが発生しました:', error);
      setQuizState('completed');
      localStorage.setItem('quizResults', JSON.stringify(results));
    }
  };

  // クイズをやり直す
  const handleRetake = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedOption(null);
    setResults(null);
    setQuizState('intro');
  };
  
  // 簡易モードと詳細モードの切り替え
  const toggleQuickMode = () => {
    setIsQuickMode(!isQuickMode);
  };

  // 教材ページへ移動
  const goToMaterial = (materialId: number) => {
    router.push('/materials');
  };

  if (quizState === 'loading') {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={48} />
      </Container>
    );
  }

  if (quizState === 'completed' && results) {
    return (
      <QuizResults 
        results={results} 
        onRetake={handleRetake} 
        isQuickMode={isQuickMode}
        recommendedMaterials={recommendedMaterials}
        onGoToMaterial={goToMaterial}
        isLoggedIn={isLoggedIn}
      />
    );
  }

  if (quizState === 'intro') {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box textAlign="center">
            <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" color="primary">
              ギバー診断
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              あなたの学習スタイルと他者への貢献傾向を分析し、最適な学習方法を提案します。
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', gap: 2, mb: 2 }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<AutoAwesome />}
                onClick={() => {
                  setIsQuickMode(true);
                  setQuizState('questioning');
                }}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  backgroundColor: 'secondary.main',
                  '&:hover': {
                    backgroundColor: 'secondary.dark',
                  }
                }}
              >
                簡易診断（5問）
              </Button>
              
              <Button
                variant="contained"
                size="large"
                endIcon={<FactCheck />}
                onClick={() => {
                  setIsQuickMode(false);
                  setQuizState('questioning');
                }}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1.1rem'
                }}
              >
                詳細診断（全問）
              </Button>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              簡易診断は約1分、詳細診断は約3分で完了します
            </Typography>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {currentQuestion && (
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                {isQuickMode ? '簡易診断' : '詳細診断'} - 質問 {currentQuestionIndex + 1}/{questionsData.length}
              </Typography>
            </Box>
            
            <QuizForm
              question={currentQuestion}
              selectedOption={selectedOption}
              onOptionSelect={handleOptionSelect}
              onPrevious={handlePrevious}
              onNext={handleNext}
              progress={progress}
              canGoBack={currentQuestionIndex > 0}
            />
          </Paper>
        </Container>
      )}
    </AnimatePresence>
  );
}; 