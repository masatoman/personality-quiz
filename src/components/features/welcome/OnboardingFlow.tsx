'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Psychology, 
  School, 
  EmojiEvents, 
  ArrowForward, 
  CheckCircle,
  Star,
  Group,
  TrendingUp
} from '@mui/icons-material';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    text: string;
    href: string;
  };
  benefit: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: 'ギバー診断で自分を知ろう',
    description: 'あなたの学習タイプを診断し、最適な学習方法を見つけます。教えることが好きな人ほど、より効果的に学習できることが科学的に証明されています。',
    icon: <Psychology sx={{ fontSize: 48, color: '#3B82F6' }} />,
    action: {
      text: 'いますぐ診断を受ける',
      href: '/quiz'
    },
    benefit: '⚡ 3分で完了・即座に結果表示'
  },
  {
    id: 2,
    title: '教材を作って深く学ぼう',
    description: '学んだ内容を教材にまとめることで、理解度が格段に向上します。「教えることで学ぶ」効果を最大限活用しましょう。',
    icon: <School sx={{ fontSize: 48, color: '#10B981' }} />,
    action: {
      text: '教材作成を体験する',
      href: '/create'
    },
    benefit: '🧠 記憶定着率が90%アップ'
  },
  {
    id: 3,
    title: 'コミュニティで成長加速',
    description: '他の学習者と教材を共有し、フィードバックを交換。お互いに教え合うことで、全員のレベルが向上します。',
    icon: <Group sx={{ fontSize: 48, color: '#8B5CF6' }} />,
    action: {
      text: 'コミュニティを探索',
      href: '/explore'
    },
    benefit: '🤝 学習効果が300%向上'
  },
  {
    id: 4,
    title: 'ポイントで成果を実感',
    description: '教材作成やフィードバック提供でポイントを獲得。努力が見える化されることで、継続的な学習習慣が身につきます。',
    icon: <EmojiEvents sx={{ fontSize: 48, color: '#F59E0B' }} />,
    benefit: '🏆 継続率が85%向上'
  }
];

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // 自動プレイ機能
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % onboardingSteps.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % onboardingSteps.length);
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev - 1 + onboardingSteps.length) % onboardingSteps.length);
  };

  const markStepCompleted = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-3xl p-8 shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🚀 ShiftWithの始め方
        </h2>
        <p className="text-lg text-gray-600">
          4つのステップで効果的な学習を始めましょう
        </p>
      </div>

      {/* プログレスバー */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {onboardingSteps.map((step, index) => (
            <React.Fragment key={step.id}>
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-blue-600 text-white shadow-lg scale-110'
                    : completedSteps.includes(step.id)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
                onClick={() => setCurrentStep(index)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {completedSteps.includes(step.id) ? (
                  <CheckCircle sx={{ fontSize: 20 }} />
                ) : (
                  <span className="font-bold">{step.id}</span>
                )}
              </motion.div>
              {index < onboardingSteps.length - 1 && (
                <div className={`w-8 h-1 rounded-full transition-colors duration-300 ${
                  index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* メインコンテンツ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl p-8 shadow-sm"
        >
          <div className="text-center mb-6">
            <div className="mb-4">
              {currentStepData.icon}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {currentStepData.title}
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              {currentStepData.description}
            </p>
            <div className="bg-blue-50 rounded-lg p-3 mb-6">
              <p className="text-blue-800 font-medium">
                {currentStepData.benefit}
              </p>
            </div>
          </div>

          {/* アクションボタン */}
          {currentStepData.action && (
            <div className="text-center mb-6">
              <Button
                variant="contained"
                size="large"
                href={currentStepData.action.href}
                onClick={() => markStepCompleted(currentStepData.id)}
                sx={{
                  px: 4,
                  py: 2,
                  fontSize: '1.1rem',
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 20px 0 rgba(59, 130, 246, 0.4)',
                  }
                }}
                endIcon={<ArrowForward />}
              >
                {currentStepData.action.text}
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ナビゲーションコントロール */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={prevStep}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          disabled={currentStep === 0}
        >
          ← 前へ
        </button>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isPlaying
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            {isPlaying ? '⏸️ 停止' : '▶️ 自動再生'}
          </button>

          <div className="text-sm text-gray-500">
            {currentStep + 1} / {onboardingSteps.length}
          </div>
        </div>

        <button
          onClick={nextStep}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          disabled={currentStep === onboardingSteps.length - 1}
        >
          次へ →
        </button>
      </div>

      {/* 完了状況の表示 */}
      {completedSteps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200"
        >
          <div className="flex items-center justify-center space-x-2">
            <Star sx={{ color: '#10B981' }} />
            <span className="text-green-800 font-medium">
              {completedSteps.length} / {onboardingSteps.length} ステップ完了！
            </span>
            {completedSteps.length === onboardingSteps.length && (
              <TrendingUp sx={{ color: '#10B981' }} />
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
} 