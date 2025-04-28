'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PersonalityType } from '@/types/quiz';
import html2canvas from 'html2canvas';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaUsers, FaBalanceScale, FaBook } from 'react-icons/fa';

// basePath の設定をインポート
const basePath = process.env.NODE_ENV === 'production' ? '/quiz' : '';

interface IconProps {
  className?: string;
}

const TwitterIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LineIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-12S17.52 2 12 2zm5.5 13.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm5.5 2c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/>
  </svg>
);

const InstagramIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
  </svg>
);

const FacebookIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const questions = [
  {
    text: '英語の勉強会で、あなたはどのように参加しますか？',
    options: [
      { text: '他の参加者の学習をサポートしながら自分も学ぶ', type: 'giver' as PersonalityType },
      { text: '自分の学習に集中して、効率よく進める', type: 'taker' as PersonalityType },
      { text: 'お互いに教え合いながら進める', type: 'matcher' as PersonalityType },
    ],
  },
  // ... 他の質問も同様に
];

type StatType = {
  count: number;
  percentage: number;
};

type TypeTotals = {
  [key in PersonalityType]: StatType;
};

type PersonalityDescription = {
  title: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  learningAdvice: {
    title: string;
    tips: string[];
    tools: string[];
  }
};

const saveResult = async (type: PersonalityType): Promise<boolean> => {
  try {
    const response = await fetch('/api/save-result/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '結果の保存に失敗しました' }));
      throw new Error(errorData.error || '結果の保存に失敗しました');
    }
    
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('結果の保存中にエラーが発生しました:', error);
    return false;
  }
};

const getPersonalityDescription = (type: PersonalityType | null): PersonalityDescription => {
  const descriptions: {[key in PersonalityType]: PersonalityDescription} = {
    giver: {
      title: '体系的学習者',
      description: '計画的で着実な学習を好む傾向があります。文法や語彙を体系的に学ぶことで、確実な進歩を実感できる時にやる気が出ます。',
      strengths: [
        '計画通りに学習を進められる',
        '基礎からしっかり積み上げていける',
        '学習の進捗を可視化できる'
      ],
      weaknesses: [
        '柔軟性に欠けることがある',
        '予定外の変更に弱い',
        '完璧主義になりすぎる傾向'
      ],
      learningAdvice: {
        title: 'おすすめの学習方法',
        tips: [
          '文法書を最初から順番に学ぶ',
          '単語帳で計画的に語彙を増やす',
          '定期的に復習時間を設ける'
        ],
        tools: [
          '文法学習アプリ',
          '単語帳アプリ',
          '学習管理ツール'
        ]
      }
    },
    taker: {
      title: '実践的学習者',
      description: '実践を通じて学ぶことを好む傾向があります。実際のコミュニケーションを通じて、生きた英語を学ぶことに意欲を感じます。',
      strengths: [
        '実践的なスキルが身につく',
        '自然な英語が身につく',
        'コミュニケーション力が向上'
      ],
      weaknesses: [
        '基礎固めが疎かになりがち',
        '体系的な学習が苦手',
        '文法の正確性に欠けることも'
      ],
      learningAdvice: {
        title: 'おすすめの学習方法',
        tips: [
          '英会話アプリで実践的に学ぶ',
          '英語の動画や音楽を活用',
          'ネイティブとの会話機会を作る'
        ],
        tools: [
          '英会話アプリ',
          '動画ストリーミング',
          'SNSでの英語コミュニケーション'
        ]
      }
    },
    matcher: {
      title: 'バランス型学習者',
      description: '理論と実践のバランスを取りながら学ぶことを好む傾向があります。基礎と応用をバランスよく学習することで、着実な成長を実感できます。',
      strengths: [
        'バランスの取れた学習が可能',
        '理論と実践を結びつけやすい',
        '柔軟な学習アプローチ'
      ],
      weaknesses: [
        '特定分野での突出が難しい',
        '目標設定が曖昧になりがち',
        '学習の優先順位付けに迷う'
      ],
      learningAdvice: {
        title: 'おすすめの学習方法',
        tips: [
          '文法学習と会話練習を組み合わせる',
          '定期的に学習方法を見直す',
          '多様な教材を活用する'
        ],
        tools: [
          '総合的な英語学習アプリ',
          'オンライン英会話',
          '学習進捗管理ツール'
        ]
      }
    }
  };

  return type ? descriptions[type] : descriptions.matcher; // デフォルトとしてmatcherを返す
};

export default function HomePage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<PersonalityType[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [personalityType, setPersonalityType] = useState<PersonalityType | null>(null);
  const [stats, setStats] = useState<TypeTotals | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (showResult && window.scrollY > 100) {
        setShowStats(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showResult]);

  const getStats = async () => {
    try {
      const response = await fetch('/api/personality-stats');
      if (!response.ok) throw new Error('統計データの取得に失敗しました');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('統計の取得中にエラーが発生しました:', error);
    }
  };

  const handleAnswer = async (type: PersonalityType) => {
    const newAnswers = [...answers, type];
    setAnswers(newAnswers);

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsLoading(true);
      const counts: { [key in PersonalityType]: number } = {
        giver: 0,
        taker: 0,
        matcher: 0
      };

      newAnswers.forEach(answer => {
        counts[answer]++;
      });

      const maxCount = Math.max(...Object.values(counts));
      const result = (Object.entries(counts) as [PersonalityType, number][])
        .find(([_, count]) => count === maxCount)?.[0] || 'matcher';

      setPersonalityType(result);
      await saveResult(result);
      await getStats();
      setShowResult(true);
      setIsLoading(false);

      // 結果が表示されたら、その位置までスムーズスクロール
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleShare = async () => {
    if (!resultRef.current) return;

    try {
      const canvas = await html2canvas(resultRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png');
      });

      if (navigator.share && blob) {
        const file = new File([blob], 'personality-result.png', { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: '英語学習タイプ診断結果',
          text: '私の英語学習タイプが判定されました！',
        });
      } else {
        // シェア機能が利用できない場合は画像をダウンロード
        const url = canvas.toDataURL();
        const a = document.createElement('a');
        a.href = url;
        a.download = 'personality-result.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('結果の共有中にエラーが発生しました:', error);
      alert('結果の共有に失敗しました。');
    }
  };

  const personalityData = personalityType ? getPersonalityDescription(personalityType) : null;

  return (
    <main className="min-h-screen bg-base text-neutral">
      <div className="container mx-auto px-4 py-8">
        {!showResult ? (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-primary mb-8 text-center">
              あなたの英語学習タイプ診断
            </h1>
            <div className="bg-base-100 rounded-lg shadow-lg p-6 mb-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">質問 {currentQuestionIndex + 1}/{questions.length}</h2>
                  <div className="text-sm text-neutral-light">
                    進捗: {Math.round((currentQuestionIndex / questions.length) * 100)}%
                  </div>
                </div>
                <div className="w-full bg-base-200 rounded-full h-2 mb-6">
                  <div
                    className="bg-primary rounded-full h-2 transition-all duration-300"
                    style={{ width: `${(currentQuestionIndex / questions.length) * 100}%` }}
                  />
                </div>
                <p className="text-lg mb-6">{questions[currentQuestionIndex].text}</p>
                <div className="space-y-4">
                  {questions[currentQuestionIndex].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(option.type)}
                      className="w-full p-4 text-left rounded-lg border border-base-300 hover:bg-primary hover:text-white transition-colors duration-200"
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto" ref={resultRef}>
            <div className="bg-base-100 rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-3xl font-bold text-primary mb-6 text-center">
                あなたの英語学習タイプは...
              </h2>
              {personalityData && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-accent mb-4">{personalityData.title}</h3>
                    <p className="text-lg">{personalityData.description}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-base-200 p-6 rounded-lg">
                      <h4 className="text-xl font-semibold mb-4 flex items-center">
                        <FaUsers className="mr-2 text-primary" />
                        強み
                      </h4>
                      <ul className="space-y-2">
                        {personalityData.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-base-200 p-6 rounded-lg">
                      <h4 className="text-xl font-semibold mb-4 flex items-center">
                        <FaBalanceScale className="mr-2 text-accent" />
                        改善点
                      </h4>
                      <ul className="space-y-2">
                        {personalityData.weaknesses.map((weakness, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-accent mr-2">•</span>
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-base-200 p-6 rounded-lg">
                    <h4 className="text-xl font-semibold mb-4 flex items-center">
                      <FaBook className="mr-2 text-secondary" />
                      {personalityData.learningAdvice.title}
                    </h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-semibold mb-2">おすすめの学習方法</h5>
                        <ul className="space-y-2">
                          {personalityData.learningAdvice.tips.map((tip, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-secondary mr-2">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold mb-2">おすすめのツール</h5>
                        <ul className="space-y-2">
                          {personalityData.learningAdvice.tools.map((tool, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-secondary mr-2">•</span>
                              {tool}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {showStats && stats && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-base-200 p-6 rounded-lg"
                    >
                      <h4 className="text-xl font-semibold mb-4">みんなの診断結果</h4>
                      <div className="space-y-4">
                        {Object.entries(stats).map(([type, data]) => (
                          <div key={type} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">
                                {type === 'giver' ? '体系的学習者' :
                                 type === 'taker' ? '実践的学習者' :
                                 'バランス型学習者'}
                              </span>
                              <span>{data.percentage.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-base-300 rounded-full h-2">
                              <div
                                className="bg-primary rounded-full h-2 transition-all duration-300"
                                style={{ width: `${data.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <div className="flex flex-col items-center space-y-4">
                    <button
                      onClick={handleShare}
                      className="bg-primary text-white px-6 py-3 rounded-full hover:bg-primary-dark transition-colors duration-200"
                    >
                      結果をシェアする
                    </button>
                    <div className="flex space-x-4">
                      <button className="p-2 hover:text-primary transition-colors duration-200">
                        <TwitterIcon className="w-6 h-6" />
                      </button>
                      <button className="p-2 hover:text-primary transition-colors duration-200">
                        <LineIcon className="w-6 h-6" />
                      </button>
                      <button className="p-2 hover:text-primary transition-colors duration-200">
                        <InstagramIcon className="w-6 h-6" />
                      </button>
                      <button className="p-2 hover:text-primary transition-colors duration-200">
                        <FacebookIcon className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      onClick={() => {
                        setCurrentQuestionIndex(0);
                        setAnswers([]);
                        setShowResult(false);
                        setPersonalityType(null);
                        setStats(null);
                        setShowStats(false);
                        window.scrollTo(0, 0);
                      }}
                      className="text-primary hover:text-primary-dark transition-colors duration-200"
                    >
                      もう一度診断する
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 