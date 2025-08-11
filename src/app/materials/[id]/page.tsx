'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FaStar, FaRegStar, FaUser, FaArrowLeft, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
// import MaterialComments from '@/components/features/materials/MaterialComments';
import MockCommentData from '@/components/features/materials/MockCommentData';

// 教材データの型定義
type Material = {
  id: string;
  title: string;
  description: string;
  content: any; // JSONB形式のコンテンツ
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  author: {
    id: string;
    name: string;
    avatar: string;
    giverScore: number;
    type: 'ギバー' | 'マッチャー' | 'テイカー';
  };
  created_at: string;
  view_count: number;
  rating: number;
  is_bookmarked: boolean;
  is_published: boolean;
  tags: string[];
};

// 関連教材の型定義
type RelatedMaterial = {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  rating: number;
  author_name: string;
}

const MaterialDetailPage = () => {
  const params = useParams();
  const materialId = params?.id as string;
  
  const [material, setMaterial] = useState<Material | null>(null);
  const [relatedMaterials, setRelatedMaterials] = useState<RelatedMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getDifficultyLabel = useCallback((level: number): 'beginner' | 'intermediate' | 'advanced' => {
    if (level <= 2) return 'beginner';
    if (level <= 3) return 'intermediate';
    return 'advanced';
  }, []);

  const getDifficultyText = useCallback((difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '初級';
      case 'intermediate': return '中級';
      case 'advanced': return '上級';
      default: return difficulty;
    }
  }, []);

  const getPersonalityType = useCallback((type: string | null): 'ギバー' | 'マッチャー' | 'テイカー' => {
    switch (type) {
      case 'giver': return 'ギバー';
      case 'matcher': return 'マッチャー';
      case 'taker': return 'テイカー';
      default: return 'マッチャー';
    }
  }, []);

  const fetchMaterial = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 外部キー参照を削除し、基本データのみ取得
      const { data: materialData, error: materialError } = await supabase
        .from('materials')
        .select(`
          id,
          title,
          description,
          content,
          category,
          tags,
          difficulty_level,
          view_count,
          rating,
          created_at,
          is_published,
          user_id
        `)
        .eq('id', materialId)
        .eq('is_published', true)
        .single();

      if (materialError) {
        console.error('Material fetch error:', materialError);
        setError('教材が見つかりませんでした');
        return;
      }

      if (!materialData) {
        setError('教材が見つかりませんでした');
        return;
      }

      // プロファイル情報を別途取得
      let authorProfile = null;
      let authorUser = null;

      if (materialData.user_id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', materialData.user_id)
          .single();

        const { data: userData } = await supabase
          .from('users')
          .select('personality_type, giver_score')
          .eq('id', materialData.user_id)
          .single();

        authorProfile = profileData;
        authorUser = userData;
      }

      // ビューカウントを増加
      await supabase
        .from('materials')
        .update({ view_count: (materialData.view_count || 0) + 1 })
        .eq('id', materialId);

      // データを Material 型に変換
      const transformedMaterial: Material = {
        id: materialData.id,
        title: materialData.title,
        description: materialData.description || '',
        content: materialData.content || '',
        category: materialData.category,
        difficulty: getDifficultyLabel(materialData.difficulty_level),
        author: {
          id: materialData.user_id,
          name: authorProfile?.display_name || '匿名ユーザー',
          avatar: authorProfile?.avatar_url || '/avatars/default.png',
          giverScore: authorUser?.giver_score || 50,
          type: getPersonalityType(authorUser?.personality_type)
        },
        created_at: materialData.created_at,
        view_count: (materialData.view_count || 0) + 1,
        rating: materialData.rating || 0,
        is_bookmarked: false, // TODO: ユーザーのブックマーク状態を取得
        is_published: materialData.is_published,
        tags: materialData.tags || []
      };

      setMaterial(transformedMaterial);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('データの取得中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [materialId, getDifficultyLabel, getPersonalityType]);

  const fetchRelatedMaterials = useCallback(async () => {
    try {
      // 基本データのみ取得
      const { data: materialsData, error } = await supabase
        .from('materials')
        .select(`
          id,
          title,
          category,
          difficulty_level,
          rating,
          user_id
        `)
        .eq('is_published', true)
        .neq('id', materialId)
        .limit(3);

      if (!error && materialsData) {
        // プロファイル情報を別途取得してマッピング
        const userIds = materialsData.map(m => m.user_id).filter(Boolean);
        let profiles: any[] = [];
        
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, display_name')
            .in('id', userIds);
          profiles = profilesData || [];
        }

        const transformed: RelatedMaterial[] = materialsData.map((item: any) => {
          const profile = profiles.find(p => p.id === item.user_id);
          return {
            id: item.id,
            title: item.title,
            category: item.category,
            difficulty: getDifficultyText(getDifficultyLabel(item.difficulty_level)),
            rating: item.rating || 0,
            author_name: profile?.display_name || '匿名ユーザー'
          };
        });
        setRelatedMaterials(transformed);
      }
    } catch (err) {
      console.error('Related materials fetch error:', err);
    }
  }, [materialId, getDifficultyLabel, getDifficultyText]);

  useEffect(() => {
    if (materialId) {
      fetchMaterial();
      fetchRelatedMaterials();
    }
  }, [materialId, fetchMaterial, fetchRelatedMaterials]);

  const toggleBookmark = () => {
    if (material) {
      setMaterial({
        ...material,
        is_bookmarked: !material.is_bookmarked
      });
      // TODO: Supabaseでブックマーク状態を更新
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderContent = (content: any) => {
    if (typeof content === 'string') {
      return (
        <div className="prose prose-lg max-w-none whitespace-pre-wrap">
          {content}
        </div>
      );
    }

    if (content && typeof content === 'object') {
      return (
        <div className="prose prose-lg max-w-none">
          {/* イントロダクション */}
          {content.introduction && (
            <div className="mb-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h3 className="text-xl font-semibold mb-3 text-blue-900">はじめに</h3>
              <p className="text-gray-700">{content.introduction}</p>
            </div>
          )}

          {/* セクション */}
          {content.sections && Array.isArray(content.sections) && (
            <div className="space-y-8">
              {content.sections.map((section: any, index: number) => (
                <div key={index} className="border rounded-lg p-6 bg-white shadow-sm">
                  {section.title && (
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                      {section.title}
                    </h3>
                  )}
                  
                  {section.content && (
                    <p className="text-gray-700 mb-4">{section.content}</p>
                  )}

                  {/* 例文・フレーズ */}
                  {section.examples && Array.isArray(section.examples) && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-3 text-gray-800">例文・フレーズ</h4>
                      <div className="grid gap-3">
                        {section.examples.map((example: any, exIndex: number) => (
                          <div key={exIndex} className="p-4 bg-gray-50 rounded-lg border-l-4 border-green-500">
                            <div className="font-medium text-green-800 mb-1">{example.phrase}</div>
                            <div className="text-gray-600 text-sm mb-1">📖 {example.japanese}</div>
                            {example.situation && (
                              <div className="text-gray-500 text-xs">💡 {example.situation}</div>
                            )}
                            {example.purpose && (
                              <div className="text-gray-500 text-xs">🎯 {example.purpose}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* クイズ */}
                  {section.type === 'quiz' && section.questions && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-3 text-gray-800">📝 練習問題</h4>
                      {section.questions.map((question: any, qIndex: number) => (
                        <div key={qIndex} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 mb-3">
                          <div className="font-medium mb-3">{question.question}</div>
                          <div className="space-y-2">
                            {question.options && question.options.map((option: string, oIndex: number) => (
                              <div key={oIndex} className={`p-2 rounded ${
                                oIndex === question.correct_answer 
                                  ? 'bg-green-100 border border-green-300' 
                                  : 'bg-gray-100'
                              }`}>
                                {oIndex + 1}. {option}
                                {oIndex === question.correct_answer && <span className="ml-2 text-green-600">✓ 正解</span>}
                              </div>
                            ))}
                          </div>
                          {question.explanation && (
                            <div className="mt-3 p-3 bg-blue-50 rounded text-sm text-blue-800">
                              💡 {question.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* その他のコンテンツタイプ */}
                  {section.items && Array.isArray(section.items) && (
                    <ul className="list-disc list-inside space-y-1 mt-4">
                      {section.items.map((item: string, itemIndex: number) => (
                        <li key={itemIndex} className="text-gray-700">{item}</li>
                      ))}
                    </ul>
                  )}

                  {/* ケーススタディ */}
                  {section.type === 'case_study' && (
                    <div className="mt-4">
                      {section.scenario && (
                        <div className="p-4 bg-purple-50 rounded-lg mb-4">
                          <h5 className="font-medium text-purple-800 mb-2">シナリオ</h5>
                          <p className="text-purple-700">{section.scenario}</p>
                        </div>
                      )}
                      {section.dialogue && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h5 className="font-medium mb-3">対話例</h5>
                          {section.dialogue.map((line: any, lineIndex: number) => (
                            <div key={lineIndex} className="mb-2">
                              <span className="font-medium text-blue-600">{line.speaker}:</span>
                              <span className="ml-2">{line.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 実践的なアドバイス */}
          {content.practical_tips && Array.isArray(content.practical_tips) && (
            <div className="mt-8 p-6 bg-green-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-green-900">実践のコツ</h3>
              <ul className="space-y-2">
                {content.practical_tips.map((tip: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 結論 */}
          {content.conclusion && (
            <div className="mt-8 p-6 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
              <h3 className="text-xl font-semibold mb-3 text-indigo-900">まとめ</h3>
              <p className="text-gray-700">{content.conclusion}</p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-500">コンテンツが利用できません。</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">教材を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || '教材が見つかりません'}
          </h1>
          <p className="text-gray-600 mb-8">指定された教材は存在しないか、削除された可能性があります。</p>
          <Link
            href="/materials"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaArrowLeft className="mr-2" />
            教材一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/materials"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            教材一覧に戻る
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 教材ヘッダー */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{material.title}</h1>
              <p className="text-lg text-gray-600 mb-6">{material.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  material.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                  material.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {getDifficultyText(material.difficulty)}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {material.category}
                </span>
                <div className="flex items-center text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>
                      {i < Math.floor(material.rating) ? <FaStar /> : <FaRegStar />}
                    </span>
                  ))}
                  <span className="ml-2 text-gray-700 text-sm">{material.rating}</span>
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <FaUser className="mr-1" />
                  {material.view_count} 閲覧
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {material.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={toggleBookmark}
              className={`ml-4 p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                material.is_bookmarked 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              aria-label={material.is_bookmarked ? 'ブックマークを削除' : 'ブックマークに追加'}
              aria-pressed={material.is_bookmarked}
            >
              {material.is_bookmarked ? <FaBookmark size={20} /> : <FaRegBookmark size={20} />}
            </button>
          </div>

          {/* 著者情報 */}
          <div className="flex items-center justify-between border-t pt-6">
            <div className="flex items-center">
              <Image
                src={material.author.avatar}
                alt={material.author.name}
                width={48}
                height={48}
                className="rounded-full mr-4"
              />
              <div>
                <h3 className="font-medium text-gray-900">{material.author.name}</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <span className={`mr-2 px-2 py-1 rounded text-xs ${
                    material.author.type === 'ギバー' ? 'bg-green-100 text-green-800' :
                    material.author.type === 'マッチャー' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {material.author.type}
                  </span>
                  <span>ギバースコア: {material.author.giverScore}</span>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              公開日: {formatDate(material.created_at)}
            </div>
          </div>
        </div>

        {/* 教材コンテンツ */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          {renderContent(material.content)}
        </div>

        {/* コメント・気づき共有セクション - テスト用モックデータ表示 */}
        <MockCommentData />
        
        {/* 実際のコメント機能（一時的に非表示）
        <MaterialComments materialId={materialId} className="mb-8" />
        */}

        {/* 関連教材 */}
        {relatedMaterials.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-6">関連教材</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedMaterials.map((relatedMaterial) => (
                <div key={relatedMaterial.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <Link href={`/materials/${relatedMaterial.id}`} className="block h-full">
                    <h4 className="font-medium mb-2 hover:text-blue-600">{relatedMaterial.title}</h4>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <span className="mr-3">{relatedMaterial.author_name}</span>
                      <div className="flex text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-xs">
                            {i < Math.floor(relatedMaterial.rating) ? <FaStar /> : <FaRegStar />}
                          </span>
                        ))}
                        <span className="ml-1 text-gray-700 text-xs">{relatedMaterial.rating}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {relatedMaterial.category}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                        {relatedMaterial.difficulty}
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialDetailPage; 