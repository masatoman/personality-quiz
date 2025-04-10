'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUsers, FaBalanceScale, FaBook, FaArrowLeft, FaShare, 
  FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaTools, 
  FaChartPie, FaLink, FaCopy, FaFileDownload, FaInfoCircle, FaTwitter, FaFacebook, FaLine, FaInstagram, FaYoutube,
  FaUserFriends, FaRegSmile, FaCheck, FaRegMeh, FaExclamation,
  FaHeadphones, FaPrint, FaHome, FaRegLightbulb, FaUserCircle, FaSignInAlt } from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { 
  LearningType, QuizResults, Tool, Scenario, LearningAdvice, 
  PersonalityType, TypeCombination, ResultsData, TabType 
} from '@/types/quiz';

// 詳細な診断データ
const resultsData: ResultsData = {
  personality_types: {
    "giver": {
      "title": "共感型学習者",
      "short_title": "共感型",
      "color": "#6246EA",
      "icon": <FaUsers size={60} className="text-blue-600 mx-auto mb-4" />,
      "description": "他者との関わりを通じて学ぶことに喜びを感じるタイプです。教えることで自身の理解も深まり、社会的な学習環境で最も力を発揮します。",
      "extended_description": "共感型学習者の詳細説明",
      "strengths": [
        "教えることで記憶の定着率が高い（プロテジェ効果）"
      ],
      "weaknesses": [
        "完璧主義になりやすい（他者の期待に応えようとする）"
      ],
      "learning_advice": {
        "tips": [
          "教えることを通じて学ぶ（ラーニング・バイ・ティーチング）"
        ],
        "tools": [
          { "name": "Anki", "description": "スペース型復習で効率的な暗記" }
        ]
      },
      "scenarios": [
        {
          "scenario": "英語の新しい文法を学ぶとき",
          "approach": "その文法を使った例文を自分で作り、クラスメイトに説明してみる。質問に答えることで理解が深まる。",
          "effectiveness_rate": 85
        }
      ]
    },
    "taker": {
      "title": "没入型学習者",
      "short_title": "没入型",
      "color": "#36B9CC",
      "icon": <FaBook size={60} className="text-cyan-600 mx-auto mb-4" />,
      "description": "深い集中状態で学ぶことを好むタイプです。自己ペースでの学習を重視し、フロー状態に入りやすい特徴があります。",
      "extended_description": "没入型学習者の詳細説明",
      "strengths": [
        "集中力が高く、フロー状態に入りやすい"
      ],
      "weaknesses": [
        "他者からのフィードバックを受けにくい"
      ],
      "learning_advice": {
        "tips": [
          "ポモドーロ・テクニックで集中と休憩のリズムを作る"
        ],
        "tools": [
          { "name": "Forest", "description": "集中力を高めるタイマーアプリ" }
        ]
      },
      "scenarios": [
        {
          "scenario": "英語の新しい文法を学ぶとき",
          "approach": "文法書で体系的に学んだ後、練習問題を解いて理解を確認。疑問点は自分で調べて解決する。",
          "effectiveness_rate": 87
        }
      ]
    },
    "matcher": {
      "title": "バランス型学習者",
      "short_title": "バランス型",
      "color": "#4CAF50",
      "icon": <FaBalanceScale size={60} className="text-green-600 mx-auto mb-4" />,
      "description": "柔軟な学習スタイルを持ち、状況に応じて適応するタイプです。多様な学習方法を取り入れ、バランスの取れた成長を遂げます。",
      "extended_description": "バランス型学習者の詳細説明",
      "strengths": [
        "様々な学習状況に適応できる柔軟性"
      ],
      "weaknesses": [
        "特定の分野で専門性を深めるのに時間がかかることがある"
      ],
      "learning_advice": {
        "tips": [
          "多様な学習リソースを組み合わせる"
        ],
        "tools": [
          { "name": "Notion", "description": "多様なフォーマットで学習管理" }
        ]
      },
      "scenarios": [
        {
          "scenario": "英語の新しい文法を学ぶとき",
          "approach": "オンライン動画で概要を理解し、友人とのディスカッションで実践。その後、個人学習で定着を図る。",
          "effectiveness_rate": 83
        }
      ]
    }
  },
  type_combinations: {
    giver_taker: {
      title: "教える没入型",
      description: "深い理解と知識共有のバランスが取れたタイプ",
      tips: ["個人学習の成果を定期的に他者と共有する"]
    },
    giver_matcher: {
      title: "柔軟な教え手",
      description: "状況に応じて教えることと学ぶことを切り替えられるタイプ",
      tips: ["グループ学習とソロ学習のバランスを意識する"]
    },
    taker_matcher: {
      title: "適応する深掘り型",
      description: "状況に応じて集中学習と相互学習を使い分けるタイプ",
      tips: ["深い集中の後に学びを共有する習慣をつける"]
    }
  }
};

const ResultsClient: React.FC = () => {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<QuizResults | null>(null);
  const [selectedTab, setSelectedTab] = useState<TabType>('strengths');
  const [savingResults, setSavingResults] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // 認証状態を取得
  const { user, signIn, loading: authLoading } = useAuth();

  useEffect(() => {
    // URLパラメータから結果を取得
    const typeParam = searchParams?.get('type') as LearningType | null;
    
    if (typeParam && ['giver', 'taker', 'matcher'].includes(typeParam)) {
      // ローカルストレージから結果を取得
      try {
        const storedResults = localStorage.getItem('quizResults');
        if (storedResults) {
          const parsedResults = JSON.parse(storedResults) as QuizResults;
          setResults(parsedResults);
          
          // ログイン済みの場合、結果を自動保存
          if (user) {
            saveResultsToDatabase(parsedResults, user.id);
          }
        } else {
          // 仮のデータ（実際のアプリではAPIから取得など）
          const mockResults: QuizResults = {
            giver: typeParam === 'giver' ? 70 : 30,
            taker: typeParam === 'taker' ? 70 : 30,
            matcher: typeParam === 'matcher' ? 70 : 40,
            dominantType: typeParam,
            percentage: {
              giver: typeParam === 'giver' ? 50 : 25,
              taker: typeParam === 'taker' ? 50 : 25,
              matcher: typeParam === 'matcher' ? 50 : 25
            }
          };
          setResults(mockResults);
        }
      } catch (error) {
        console.error('結果の解析中にエラーが発生しました:', error);
      }
    }
    
    setLoading(false);
  }, [searchParams, user]);

  // 結果をデータベースに保存する関数
  const saveResultsToDatabase = async (results: QuizResults, userId: string) => {
    try {
      setSavingResults(true);
      setSaveError(null);
      
      const response = await fetch('/api/quiz/save-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...results,
          userId
        }),
      });
      
      if (!response.ok) {
        throw new Error(`結果の保存に失敗しました: ${response.status}`);
      }
      
      setSaveSuccess(true);
    } catch (error) {
      console.error('結果の保存中にエラーが発生しました:', error);
      setSaveError(error instanceof Error ? error.message : '保存中にエラーが発生しました');
    } finally {
      setSavingResults(false);
    }
  };
  
  // ログインに誘導する関数
  const handleLoginPrompt = () => {
    // ここでモーダルを表示したり、ログインページに遷移したりする処理を追加
    if (results) {
      localStorage.setItem('pendingResults', JSON.stringify(results));
    }
    // 例: ログインページへリダイレクト
    window.location.href = '/login';
  };

  // セカンダリタイプを取得する関数
  const getSecondaryType = (giver: number, taker: number, matcher: number, dominantType: LearningType): LearningType | 'balanced' => {
    const scores: Record<LearningType, number> = { giver, taker, matcher };
    delete scores[dominantType]; // 主要タイプを除外
    
    // 残りの2つのタイプの差が小さい場合はバランス型
    const types = Object.keys(scores) as LearningType[];
    const diff = Math.abs(scores[types[0]] - scores[types[1]]);
    
    if (diff <= 5) {
      return 'balanced';
    }
    
    // それ以外の場合は2番目に高いスコアのタイプを返す
    return scores[types[0]] > scores[types[1]] ? types[0] : types[1];
  };

  // セカンダリタイプがある場合、タイプ組み合わせを取得
  const getCombinationType = (primaryType: LearningType, secondaryType: LearningType | 'balanced'): TypeCombination | null => {
    if (secondaryType === 'balanced') {
      return null;
    }
    
    const key = [primaryType, secondaryType].sort().join('_') as 'giver_taker' | 'giver_matcher' | 'taker_matcher';
    return resultsData.type_combinations[key] || null;
  };

  // 結果が読み込まれていない場合のローディング表示
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 結果がない場合
  if (!results) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold mb-4">診断結果が見つかりません</h1>
        <p className="mb-4">診断が完了していないか、結果が正しく保存されていません。</p>
        <Link href="/quiz" className="text-blue-600 hover:underline flex items-center justify-center">
          <FaArrowLeft className="mr-2" /> 診断に戻る
        </Link>
      </div>
    );
  }

  const { dominantType } = results;
  const personalityType = resultsData.personality_types[dominantType];
  const secondaryType = getSecondaryType(results.giver, results.taker, results.matcher, dominantType);
  const combinationType = getCombinationType(dominantType, secondaryType);

  return (
    <div className="results-page bg-gray-50 min-h-screen pb-12">
      <header className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center">
              <FaHome className="mr-2" /> ホーム
            </Link>
            <h1 className="text-lg md:text-xl font-bold text-center">英語学習タイプ診断結果</h1>
            {user ? (
              <Link href="/profile" className="text-gray-600 hover:text-gray-900 flex items-center">
                <FaUserCircle className="mr-2" /> プロフィール
              </Link>
            ) : (
              <button 
                onClick={handleLoginPrompt}
                className="text-gray-600 hover:text-gray-900 flex items-center"
              >
                <FaSignInAlt className="mr-2" /> ログイン
              </button>
            )}
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 mt-8">
        {/* 未ログイン時の結果保存プロンプト */}
        {!user && results && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaInfoCircle className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  結果を保存してあなたの進捗を追跡するにはログインしてください。
                </p>
                <div className="mt-2">
                  <button
                    onClick={handleLoginPrompt}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
                  >
                    ログインして保存
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 保存成功メッセージ */}
        {saveSuccess && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaCheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  結果が正常に保存されました。プロフィールページで確認できます。
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* 保存エラーメッセージ */}
        {saveError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {saveError}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="text-center mb-6">
            {personalityType.icon}
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{personalityType.title}</h2>
            <p className="text-lg text-gray-600">{personalityType.description}</p>
          </div>
          
          <div className="tabs flex border-b overflow-x-auto">
            <button 
              className={`px-4 py-2 font-medium ${selectedTab === 'strengths' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setSelectedTab('strengths')}
            >
              <FaCheckCircle className="inline mr-2" />
              強み
            </button>
            <button 
              className={`px-4 py-2 font-medium ${selectedTab === 'weaknesses' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setSelectedTab('weaknesses')}
            >
              <FaExclamationTriangle className="inline mr-2" />
              弱み
            </button>
            <button 
              className={`px-4 py-2 font-medium ${selectedTab === 'advice' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setSelectedTab('advice')}
            >
              <FaLightbulb className="inline mr-2" />
              アドバイス
            </button>
            <button 
              className={`px-4 py-2 font-medium ${selectedTab === 'tools' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setSelectedTab('tools')}
            >
              <FaTools className="inline mr-2" />
              ツール
            </button>
            <button 
              className={`px-4 py-2 font-medium ${selectedTab === 'scenarios' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setSelectedTab('scenarios')}
            >
              <FaRegLightbulb className="inline mr-2" />
              シナリオ
            </button>
          </div>
          
          <div className="tab-content py-6">
            {selectedTab === 'strengths' && (
              <ul className="space-y-2">
                {personalityType.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            )}
            
            {selectedTab === 'weaknesses' && (
              <ul className="space-y-2">
                {personalityType.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-amber-500 mr-2">!</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            )}
            
            {selectedTab === 'advice' && (
              <ul className="space-y-2">
                {personalityType.learning_advice.tips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            )}
            
            {selectedTab === 'tools' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {personalityType.learning_advice.tools.map((tool, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-bold mb-1">{tool.name}</h3>
                    <p className="text-sm text-gray-600">{tool.description}</p>
                  </div>
                ))}
              </div>
            )}
            
            {selectedTab === 'scenarios' && (
              <div className="space-y-6">
                {personalityType.scenarios.map((scenario, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <h3 className="font-bold mb-2">{scenario.scenario}</h3>
                    <p className="mb-2">{scenario.approach}</p>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">効果性:</span>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${scenario.effectiveness_rate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500 ml-2">{scenario.effectiveness_rate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {combinationType && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">{combinationType.title}</h2>
            <p className="mb-4">{combinationType.description}</p>
            <h3 className="font-semibold mb-2">組み合わせタイプのアドバイス:</h3>
            <ul className="space-y-2">
              {combinationType.tips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">あなたの診断結果グラフ</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: '共感型', value: results.percentage.giver },
                    { name: '没入型', value: results.percentage.taker },
                    { name: 'バランス型', value: results.percentage.matcher }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell key="giver" fill="#6246EA" />
                  <Cell key="taker" fill="#36B9CC" />
                  <Cell key="matcher" fill="#4CAF50" />
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">次のステップ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-bold mb-2 flex items-center">
                <FaBook className="mr-2 text-blue-500" />
                おすすめの学習リソース
              </h3>
              <p>あなたの学習タイプに合った教材やリソースを見つけましょう。</p>
              <Link href="/resources" className="text-blue-600 hover:underline mt-2 inline-block">
                リソースを探す →
              </Link>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-bold mb-2 flex items-center">
                <FaUserFriends className="mr-2 text-green-500" />
                学習コミュニティ
              </h3>
              <p>同じ学習タイプの仲間と一緒に学習効果を高めましょう。</p>
              <Link href="/community" className="text-blue-600 hover:underline mt-2 inline-block">
                コミュニティに参加する →
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">英語学習タイプ診断</h3>
              <p className="text-gray-300 text-sm">
                あなたの英語学習スタイルを理解し、最適な学習方法を見つけるためのオンライン診断ツールです。
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">共有する</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-white hover:text-blue-400">
                  <FaTwitter size={20} />
                </a>
                <a href="#" className="text-white hover:text-blue-600">
                  <FaFacebook size={20} />
                </a>
                <a href="#" className="text-white hover:text-green-400">
                  <FaLine size={20} />
                </a>
                <a href="#" className="text-white hover:text-pink-500">
                  <FaInstagram size={20} />
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">クイック リンク</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="text-gray-300 hover:text-white">
                    ホーム
                  </Link>
                </li>
                <li>
                  <Link href="/quiz" className="text-gray-300 hover:text-white">
                    診断を受ける
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-300 hover:text-white">
                    このサイトについて
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ResultsClient; 