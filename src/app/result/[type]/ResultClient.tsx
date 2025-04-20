'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PersonalityType, TypeStats, Stats } from '@/types/quiz';
import html2canvas from 'html2canvas';
import { useRouter, useSearchParams } from 'next/navigation';
import { getPersonalityDescription } from '@/lib/personalities';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import Link from 'next/link';
import { FaTwitter, FaInstagram, FaFacebook, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { SiLine } from 'react-icons/si';
import { FaLightbulb, FaBook, FaTools } from 'react-icons/fa';

type ResultContentProps = {
  type: PersonalityType;
};

type StatsResponse = {
  stats: Stats;
  message: string;
};

export const ResultContent = ({ type }: ResultContentProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const { handleError } = useErrorHandler();

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stats/${type}`);
      if (!response.ok) {
        throw new Error('統計データの取得に失敗しました');
      }
      const data: StatsResponse = await response.json();
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('不明なエラーが発生しました'));
      handleError(err instanceof Error ? err : new Error('不明なエラーが発生しました'));
    } finally {
      setLoading(false);
    }
  }, [type, handleError]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleInstagramShare = async () => {
    if (!resultRef.current) return;
    
    try {
      const canvas = await html2canvas(resultRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });
      
      canvas.toBlob((blob) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `英語学習タイプ診断_${type}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('画像を保存しました。\nこの画像をインスタグラムでシェアしてください。');
      }, 'image/png');
    } catch (error) {
      console.error('スクリーンショットの作成に失敗しました:', error);
      alert('スクリーンショットの作成に失敗しました。');
    }
  };

  const shareResult = (platform: 'twitter' | 'line' | 'instagram' | 'facebook') => {
    const text = `私の英語学習タイプは「${getPersonalityDescription(type as PersonalityType).title}」でした！\n\n診断してみる👉`;
    const url = new URL(window.location.origin + '/quiz');
    const shareUrl = url.toString();

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'line':
        window.open(`https://line.me/R/msg/text/?${encodeURIComponent(text + shareUrl)}`, '_blank');
        break;
      case 'instagram':
        handleInstagramShare();
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
    }
  };

  const description = getPersonalityDescription(type as PersonalityType);
  const title = description.title;
  const strengths = description.strengths;
  const weaknesses = description.weaknesses;
  const learningMethods = description.learningAdvice.tips;
  const tools = description.learningAdvice.tools;

  return (
    <main className="min-h-screen bg-mesh py-8 px-4">
      <div className="container mx-auto">
        <div className="result-section" ref={resultRef}>
          <div className="result-header">
            <div className="type-badge">{title}</div>
            <h1 className="text-2xl font-bold mb-4">
              あなたの英語学習タイプは「{title}」です
            </h1>
          </div>

          <div className="type-description">
            {description.description}
          </div>

          {loading ? (
            <p className="text-center py-4">統計情報を読み込み中...</p>
          ) : error ? (
            <p className="text-center text-red-600 py-4">{error.message}</p>
          ) : stats && (
            <div className="mb-8 p-6 bg-surface-light rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-center">あなたの傾向分析</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="font-bold text-xl text-giver mb-1">{stats.giver.percentage}%</div>
                  <div className="text-sm text-gray-600">ギバー型</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-xl text-matcher mb-1">{stats.matcher.percentage}%</div>
                  <div className="text-sm text-gray-600">マッチャー型</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-xl text-taker mb-1">{stats.taker.percentage}%</div>
                  <div className="text-sm text-gray-600">テイカー型</div>
                </div>
              </div>
            </div>
          )}

          <div className="strengths-weaknesses">
            <div className="flex items-center gap-2 font-semibold text-lg mb-4">
              <FaCheckCircle className="text-success" size={20} />
              <span>強み</span>
            </div>
            <ul className="feature-list">
              {strengths && strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>

            <div className="flex items-center gap-2 font-semibold text-lg mb-4 mt-6">
              <FaExclamationTriangle className="text-warning" size={20} />
              <span>弱み</span>
            </div>
            <ul className="feature-list">
              {weaknesses && weaknesses.map((weakness, index) => (
                <li key={index}>{weakness}</li>
              ))}
            </ul>
          </div>

          <div className="recommendations">
            <h2>{description.learningAdvice.title}</h2>
            <div className="recommendation-section">
              <h3>
                <FaLightbulb className="inline-block mr-2" />
                おすすめの学習方法
              </h3>
              <ul className="feature-list">
                {learningMethods && learningMethods.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>

            <div className="recommendation-section">
              <h3>
                <FaTools className="inline-block mr-2" />
                おすすめの学習ツール
              </h3>
              {tools && tools.map((tool, index) => (
                <div key={index} className="tool-item">
                  <div className="tool-icon">
                    <FaBook className="text-primary" />
                  </div>
                  <div className="tool-info">
                    <h4>{tool}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="share-section mt-8">
            <h3 className="text-lg font-semibold mb-4">診断結果をシェアする</h3>
            <div className="flex flex-wrap gap-4 justify-center">
              <button 
                onClick={() => shareResult('twitter')}
                className="bg-[#1DA1F2] text-white p-2 rounded-full hover:opacity-80 transition"
              >
                <FaTwitter size={24} />
              </button>
              <button 
                onClick={() => shareResult('line')}
                className="bg-[#06C755] text-white p-2 rounded-full hover:opacity-80 transition"
              >
                <SiLine size={24} />
              </button>
              <button 
                onClick={() => shareResult('instagram')}
                className="bg-gradient-to-tr from-[#FFDC80] via-[#F56040] to-[#833AB4] text-white p-2 rounded-full hover:opacity-80 transition"
              >
                <FaInstagram size={24} />
              </button>
              <button 
                onClick={() => shareResult('facebook')}
                className="bg-[#1877F2] text-white p-2 rounded-full hover:opacity-80 transition"
              >
                <FaFacebook size={24} />
              </button>
            </div>
          </div>
          
          <div className="retry-section mt-8 text-center">
            <Link href="/quiz" className="inline-block px-6 py-3 bg-secondary text-white rounded-lg shadow-lg hover:bg-secondary-dark transition-colors">
              診断をやり直す
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default function ResultClient({
  personalityType
}: {
  personalityType: PersonalityType
}) {
  return (
    <ErrorBoundary
      fallback={({ error, reset }) => (
        <div className="text-center py-8">
          <h2 className="text-xl font-bold text-red-600 mb-4">エラーが発生しました</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={reset}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
          >
            再試行
          </button>
        </div>
      )}
    >
      <ResultContent type={personalityType} />
    </ErrorBoundary>
  );
} 