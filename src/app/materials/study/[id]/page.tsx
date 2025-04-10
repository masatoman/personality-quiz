'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import MaterialViewer from '@/components/MaterialViewer';

interface StudyPageProps {
  params: { id: string };
}

export default function StudyMaterialPage({ params }: StudyPageProps) {
  const [material, setMaterial] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // 教材データの取得
    const fetchMaterial = async () => {
      try {
        // 実際の実装ではAPIからデータを取得
        const response = await fetch(`/api/materials/${params.id}`);
        const data = await response.json();
        setMaterial(data);
      } catch (error) {
        console.error('教材データの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaterial();
  }, [params.id]);
  
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 flex justify-center items-center min-h-[200px]">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  if (!material) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <p>教材データの取得に失敗しました。もう一度お試しください。</p>
          <Link href="/materials" className="text-blue-600 hover:underline mt-2 inline-block">
            教材一覧に戻る
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <Link 
          href={`/materials/${params.id}`} 
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          <span>教材詳細に戻る</span>
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-4">{material.title}</h1>
      
      <div className="mb-6">
        <MaterialViewer 
          sections={material.sections}
          onComplete={() => {
            // 学習完了時の処理
            alert('お疲れ様でした！教材を完了しました。');
          }}
          onQuizSubmit={(quizId, answers, score) => {
            // クイズ提出時の処理
            console.log('Quiz submitted:', { quizId, answers, score });
            // 実際はここでAPIを呼んで結果を保存するなどの処理を入れる
          }}
        />
      </div>
    </div>
  );
} 