'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FaStar, FaRegStar, FaUser, FaClock, FaArrowLeft, FaChevronRight, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import Image from 'next/image';

// 教材データの型定義
type Material = {
  id: string;
  title: string;
  description: string;
  content: string;
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
}

// 評価・コメントの型定義
type Feedback = {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  rating: number;
  comment: string;
  created_at: string;
}

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
  const router = useRouter();
  const materialId = params.id as string;

  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [relatedMaterials, setRelatedMaterials] = useState<RelatedMaterial[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // 教材データの取得（実際はSupabaseから取得）
    const fetchMaterial = async () => {
      setLoading(true);
      try {
        // IDに応じたモックデータを選択
        let mockMaterial: Material;
        
        switch(materialId) {
          case '1':
            mockMaterial = {
              id: '1',
              title: 'ビジネス英語の基礎',
              description: 'ビジネスシーンで使える基本的な英語表現とコミュニケーション戦略を学びます',
              content: `
              <h2>ビジネス英語の基本</h2>
              <p>ビジネス英語は、職場や商談などの専門的な環境で使用される英語の一形態です。フォーマルな表現や業界特有の用語が多く使われます。</p>
              
              <h3>キーポイント</h3>
              <ul>
                <li>明確さと簡潔さを重視する</li>
                <li>適切な敬語表現を使用する</li>
                <li>文化的な違いに配慮する</li>
              </ul>
              
              <h2>挨拶と自己紹介</h2>
              
              <h3>1. 基本的な挨拶</h3>
              <div class="example-box">
                <p>"Good morning/afternoon/evening."</p>
                <p>"It's a pleasure to meet you."</p>
                <p>"Thank you for taking the time to meet with me today."</p>
              </div>
              
              <h3>2. 自己紹介</h3>
              <div class="example-box">
                <p>"My name is [Your Name]. I'm the [Your Position] at [Your Company]."</p>
                <p>"I've been working in the [Industry] industry for [Number] years."</p>
                <p>"I'm responsible for [Your Responsibilities]."</p>
              </div>
              
              <h2>電話とメール</h2>
              <p>ビジネスコミュニケーションでは、電話やメールのスキルが非常に重要です。</p>
              
              <div class="example-box">
                <p>"Hello, this is [Your Name] from [Your Company]."</p>
                <p>"I'm calling/writing regarding..."</p>
                <p>"Could I speak to [Person's Name], please?"</p>
                <p>"I look forward to hearing from you soon."</p>
                <p>"Should you have any questions, please don't hesitate to contact me."</p>
              </div>
              `,
              category: 'ビジネス英語',
              difficulty: 'beginner',
              author: {
                id: '550e8400-e29b-41d4-a716-446655440001',
                name: 'ギバー太郎',
                avatar: '/avatars/giver.png',
                giverScore: 85,
                type: 'ギバー'
              },
              created_at: '2023-09-15T10:30:00Z',
              view_count: 345,
              rating: 4.8,
              is_bookmarked: false,
              is_published: true,
              tags: ['ビジネス英語', '自己紹介', 'メール', '電話対応']
            };
            break;
            
          case '2':
            mockMaterial = {
              id: '2',
              title: '日常英会話マスター',
              description: '日常生活で役立つ実践的な英会話表現とシチュエーション別のフレーズ集',
              content: `
              <h2>日常英会話の基本</h2>
              <p>日常英会話は、カジュアルな状況で使われる自然な英語表現です。文法的に完璧である必要はなく、コミュニケーションの流れを重視します。</p>
              
              <h3>キーポイント</h3>
              <ul>
                <li>自然な表現と縮約形を使う</li>
                <li>相手の話をよく聞き、適切に応答する</li>
                <li>文脈に応じた表現を選ぶ</li>
              </ul>
              
              <h2>カフェやレストランでの会話</h2>
              
              <h3>1. 注文する</h3>
              <div class="example-box">
                <p>"I'd like a coffee, please."</p>
                <p>"Could I have the menu, please?"</p>
                <p>"What do you recommend?"</p>
              </div>
              
              <h3>2. 支払い</h3>
              <div class="example-box">
                <p>"Can I have the bill/check, please?"</p>
                <p>"Do you take credit cards?"</p>
                <p>"Could we have separate checks?"</p>
              </div>
              
              <h2>道案内と交通</h2>
              <p>旅行や外出時に役立つ表現です。</p>
              
              <div class="example-box">
                <p>"Excuse me, could you tell me how to get to the station?"</p>
                <p>"Is this the right way to the museum?"</p>
                <p>"How much is the fare to downtown?"</p>
                <p>"Could you recommend a good hotel in this area?"</p>
                <p>"I think I'm lost. Could you help me find this address?"</p>
              </div>
              `,
              category: '日常会話',
              difficulty: 'intermediate',
              author: {
                id: '550e8400-e29b-41d4-a716-446655440002',
                name: 'マッチャー花子',
                avatar: '/avatars/matcher.png',
                giverScore: 72,
                type: 'マッチャー'
              },
              created_at: '2023-10-05T14:30:00Z',
              view_count: 287,
              rating: 4.6,
              is_bookmarked: false,
              is_published: true,
              tags: ['日常会話', '旅行', 'レストラン', '道案内']
            };
            break;
            
          case '3':
            mockMaterial = {
              id: '3',
              title: '英語発音のコツとトレーニング',
              description: 'ネイティブのような発音を身につけるための実践的なトレーニング方法',
              content: `
              <h2>英語発音の基礎</h2>
              <p>英語の発音は、リスニングとスピーキング能力の向上に直結する重要なスキルです。正しい口の形や舌の位置を意識することが大切です。</p>
              
              <h3>キーポイント</h3>
              <ul>
                <li>母音と子音の正確な発音</li>
                <li>リズムとイントネーション</li>
                <li>リンキングとリダクション</li>
              </ul>
              
              <h2>母音の発音</h2>
              
              <h3>1. 単母音</h3>
              <div class="example-box">
                <p>/i:/ - sheep, meet, leaf</p>
                <p>/ɪ/ - ship, bit, fish</p>
                <p>/e/ - bed, head, said</p>
              </div>
              
              <h3>2. 二重母音</h3>
              <div class="example-box">
                <p>/eɪ/ - face, day, break</p>
                <p>/aɪ/ - price, fly, buy</p>
                <p>/ɔɪ/ - choice, boy, employ</p>
              </div>
              
              <h2>リズムとイントネーション</h2>
              <p>英語は強弱のリズムを持つ言語です。強調される単語や音節に注意しましょう。</p>
              
              <div class="example-box">
                <p>"I'm GOing to the STORE." (強調される音節を大文字で表示)</p>
                <p>"Do you WANT to GO to the MOvie?"</p>
                <p>"She's a DOCtor, NOT a TEACHer."</p>
              </div>
              
              <h2>練習方法</h2>
              <p>効果的な発音練習のテクニックをいくつか紹介します。</p>
              
              <div class="example-box">
                <p>1. シャドーイング：音声を聞きながら少し遅れて同じ内容を繰り返す</p>
                <p>2. 録音して比較：自分の発音を録音し、ネイティブの発音と比較する</p>
                <p>3. 舌の体操：発音前に舌をほぐす簡単なエクササイズを行う</p>
              </div>
              `,
              category: '発音・スピーキング',
              difficulty: 'advanced',
              author: {
                id: '550e8400-e29b-41d4-a716-446655440003',
                name: 'テイカー次郎',
                avatar: '/avatars/taker.png',
                giverScore: 45,
                type: 'テイカー'
              },
              created_at: '2023-11-10T09:30:00Z',
              view_count: 178,
              rating: 4.9,
              is_bookmarked: false,
              is_published: true,
              tags: ['発音', 'スピーキング', 'リスニング', '音声学']
            };
            break;
            
          default:
            // デフォルトの教材データ（ID不明の場合）
            mockMaterial = {
              id: materialId,
              title: 'ビジネス英語：互恵的関係の構築',
              description: 'ビジネスシーンで互恵的な関係を構築するための英語表現とコミュニケーション戦略を学びます。',
              content: `
              <h2>互恵的関係とは</h2>
              <p>互恵的関係（reciprocal relationship）とは、双方が利益を得られる関係性のことです。ビジネスにおいて、長期的かつ持続可能なパートナーシップを築くためには、この互恵性が不可欠です。</p>
              
              <h3>キーポイント</h3>
              <ul>
                <li>信頼関係の構築（Building Trust）</li>
                <li>価値の交換（Exchange of Value）</li>
                <li>長期的視点（Long-term Perspective）</li>
              </ul>
              
              <h2>役立つ英語表現</h2>
              
              <h3>1. 関係構築のための表現</h3>
              <div class="example-box">
                <p>"I believe we can create a win-win situation here."</p>
                <p>（ここでは双方にとって良い状況を作れると思います。）</p>
              </div>
              
              <div class="example-box">
                <p>"We're looking for a long-term partnership that benefits both parties."</p>
                <p>（私たちは双方に利益をもたらす長期的なパートナーシップを求めています。）</p>
              </div>
              
              <h3>2. 価値提案の表現</h3>
              <div class="example-box">
                <p>"What we bring to the table is..."</p>
                <p>（私たちが提供できるのは...）</p>
              </div>
              
              <div class="example-box">
                <p>"In return for your expertise, we can offer..."</p>
                <p>（あなたの専門知識に対して、私たちは...を提供できます。）</p>
              </div>
              
              <h3>3. 協力の提案</h3>
              <div class="example-box">
                <p>"How can we support each other's goals?"</p>
                <p>（どのようにお互いの目標をサポートできるでしょうか？）</p>
              </div>
              
              <div class="example-box">
                <p>"I see potential synergies between our companies."</p>
                <p>（私たちの会社間に潜在的な相乗効果を見ています。）</p>
              </div>
              
              <h2>実践エクササイズ</h2>
              <p>次のシナリオに基づいて、互恵的関係を構築するための会話を練習してみましょう：</p>
              
              <div class="scenario-box">
                <p><strong>シナリオ：</strong> あなたは小規模なデザイン会社の代表です。大手企業のマーケティング部門と会議を持ち、潜在的なコラボレーションについて話し合います。彼らはブランドの刷新を検討していますが、予算に制約があります。あなたの会社は露出を必要としています。互恵的な提案をしてください。</p>
              </div>
              `,
              category: 'ビジネス英語',
              difficulty: 'intermediate',
              author: {
                id: '550e8400-e29b-41d4-a716-446655440001',
                name: 'ギバー太郎',
                avatar: '/avatars/giver.png',
                giverScore: 85,
                type: 'ギバー'
              },
              created_at: '2023-09-15T10:30:00Z',
              view_count: 234,
              rating: 4.7,
              is_bookmarked: false,
              is_published: true,
              tags: ['ビジネス英語', '交渉', 'コミュニケーション', '関係構築']
            };
        }

        setMaterial(mockMaterial);
        setIsBookmarked(mockMaterial.is_bookmarked);

        // 評価・コメントのモックデータ
        const mockFeedbacks: Feedback[] = [
          {
            id: 'f1',
            user_id: '550e8400-e29b-41d4-a716-446655440002',
            user_name: 'マッチャー花子',
            user_avatar: '/avatars/matcher.png',
            rating: 5,
            comment: 'とても実践的な内容でした！実際のビジネスシーンで使える表現が多く学べました。特に「価値提案の表現」のセクションが役立ちました。',
            created_at: '2023-10-05T14:25:00Z'
          },
          {
            id: 'f2',
            user_id: '550e8400-e29b-41d4-a716-446655440003',
            user_name: 'テイカー次郎',
            user_avatar: '/avatars/taker.png',
            rating: 4,
            comment: '全体的に良い内容でした。もう少し例文が多いと理解が深まると思います。それでも十分参考になりました。',
            created_at: '2023-10-01T09:15:00Z'
          }
        ];
        setFeedbacks(mockFeedbacks);

        // 関連教材のモックデータ - 現在の教材IDに基づいて関連コンテンツを調整
        const allMaterials = [
          {
            id: '1',
            title: 'ビジネス英語の基礎',
            category: 'ビジネス英語',
            difficulty: 'beginner',
            rating: 4.8,
            author_name: 'ギバー太郎'
          },
          {
            id: '2',
            title: '日常英会話マスター',
            category: '日常会話',
            difficulty: 'intermediate',
            rating: 4.6,
            author_name: 'マッチャー花子'
          },
          {
            id: '3',
            title: '英語発音のコツとトレーニング',
            category: '発音・スピーキング',
            difficulty: 'advanced',
            rating: 4.9,
            author_name: 'テイカー次郎'
          },
          {
            id: '4',
            title: 'ポリートレスポンスガイド',
            category: 'ビジネス英語',
            difficulty: 'beginner',
            rating: 4.5,
            author_name: 'ギバー太郎'
          },
          {
            id: '5',
            title: 'ビジネスミーティングでのプレゼンテーション術',
            category: 'ビジネス英語',
            difficulty: 'intermediate',
            rating: 4.7,
            author_name: 'マッチャー花子'
          },
          {
            id: '6',
            title: '英語でのネゴシエーション：基本戦略',
            category: 'ビジネス英語',
            difficulty: 'advanced',
            rating: 4.9,
            author_name: 'ギバー太郎'
          }
        ];
        
        // 現在の教材以外から3つをランダムに選択
        const relatedMaterials = allMaterials
          .filter(m => m.id !== materialId)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
          
        setRelatedMaterials(relatedMaterials);
      } catch (err) {
        console.error('教材データの取得に失敗しました', err);
        setError('教材データの取得に失敗しました。再度お試しください。');
      } finally {
        setLoading(false);
      }
    };

    if (materialId) {
      fetchMaterial();
    }
  }, [materialId]);

  // ブックマーク切り替え
  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // ここでSupabaseに状態を保存
  };

  // 評価送信
  const submitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRating === 0) {
      alert('評価を選択してください');
      return;
    }

    setSubmitting(true);
    
    // 実際はSupabaseに保存処理
    setTimeout(() => {
      const newFeedback: Feedback = {
        id: `f${feedbacks.length + 1}`,
        user_id: 'current-user-id',
        user_name: 'あなた',
        user_avatar: '/avatars/default.png',
        rating: userRating,
        comment: comment,
        created_at: new Date().toISOString()
      };

      setFeedbacks([newFeedback, ...feedbacks]);
      setUserRating(0);
      setComment('');
      setSubmitting(false);
    }, 1000);
  };

  // 学習完了ボタン
  const markAsCompleted = () => {
    // 実際はSupabaseに完了ステータスを保存
    alert('学習を完了しました！ポイントが加算されました。');
    // router.push('/materials');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-40 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || '教材が見つかりませんでした'}</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => router.back()}
          className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="mr-2" /> 戻る
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 戻るボタン */}
      <div className="mb-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-blue-600"
        >
          <FaArrowLeft className="mr-2" /> 一覧に戻る
        </button>
      </div>
      
      {/* 教材ヘッダー */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap justify-between items-start">
          <div className="w-full md:w-3/4">
            <h1 className="text-3xl font-bold mb-3">{material.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {material.category === 'business' ? 'ビジネス英語' : 
                 material.category === 'communication' ? 'コミュニケーション' : material.category}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                {material.difficulty === 'beginner' ? '初級' : 
                 material.difficulty === 'intermediate' ? '中級' : '上級'}
              </span>
              <div className="flex items-center text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>
                    {i < Math.floor(material.rating) ? <FaStar /> : 
                     i === Math.floor(material.rating) && material.rating % 1 > 0 ? <FaStar /> : <FaRegStar />}
                  </span>
                ))}
                <span className="ml-1 text-gray-700">{material.rating}</span>
              </div>
              <span className="text-gray-500 flex items-center">
                <FaUser className="mr-1" /> 閲覧数: {material.view_count}
              </span>
            </div>
            <p className="text-gray-700 mb-4">{material.description}</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <button 
                  onClick={toggleBookmark}
                  className="flex items-center text-gray-600 hover:text-blue-600"
                >
                  {isBookmarked ? <FaBookmark className="text-blue-500" /> : <FaRegBookmark />}
                  <span className="ml-1">{isBookmarked ? 'ブックマーク中' : 'ブックマーク'}</span>
                </button>
              </div>
              <div className="flex items-center text-gray-500">
                <FaClock className="mr-1" /> 
                {new Date(material.created_at).toLocaleDateString('ja-JP')}
              </div>
            </div>
          </div>
          
          {/* 作成者情報 */}
          <div className="w-full md:w-1/4 mt-6 md:mt-0 md:text-right">
            <Link href={`/profile/${material.author.id}`} className="inline-block">
              <div className="flex items-center justify-end mb-2">
                <div className="mr-3">
                  <div className="font-medium">{material.author.name}</div>
                  <div className="text-sm text-gray-500">{material.author.type}タイプ</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                  <Image 
                    src={material.author.avatar || '/avatars/default.png'} 
                    alt={material.author.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="text-sm">
                ギバースコア: <span className="font-bold text-blue-600">{material.author.giverScore}</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
      
      {/* 教材コンテンツ */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <article className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: material.content }} />
        </article>
        
        {/* タグ一覧 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium mb-3">タグ</h3>
          <div className="flex flex-wrap gap-2">
            {material.tags.map((tag, index) => (
              <Link 
                key={index} 
                href={`/materials/tag/${encodeURIComponent(tag)}`}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      {/* 学習完了セクション */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">理解度確認</h3>
        <p className="mb-4">この教材の内容を理解できましたか？学習完了としてマークすると、学習履歴に記録され、ポイントが獲得できます。</p>
        <button 
          onClick={markAsCompleted}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          学習完了としてマーク
        </button>
      </div>
      
      {/* 評価・コメントセクション */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">評価とフィードバック</h3>
        
        {/* 評価フォーム */}
        <form onSubmit={submitFeedback} className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium mb-3">この教材を評価する</h4>
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <span className="mr-3">評価：</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    type="button"
                    onClick={() => setUserRating(star)}
                    className={`text-2xl focus:outline-none ${userRating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="コメントを入力してください（任意）"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <button
            type="submit"
            disabled={submitting || userRating === 0}
            className={`px-4 py-2 bg-blue-600 text-white rounded ${
              submitting || userRating === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {submitting ? '送信中...' : '評価を送信'}
          </button>
        </form>
        
        {/* 評価一覧 */}
        <div>
          <h4 className="font-medium mb-4">フィードバック一覧</h4>
          {feedbacks.length === 0 ? (
            <p className="text-gray-500">まだフィードバックはありません。最初の評価を投稿してみませんか？</p>
          ) : (
            <div className="space-y-6">
              {feedbacks.map((feedback) => (
                <div key={feedback.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-4">
                      <Image 
                        src={feedback.user_avatar || '/avatars/default.png'}
                        alt={feedback.user_name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium">{feedback.user_name}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(feedback.created_at).toLocaleDateString('ja-JP')}
                        </div>
                      </div>
                      <div className="flex text-yellow-500 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>
                            {i < feedback.rating ? <FaStar /> : <FaRegStar />}
                          </span>
                        ))}
                      </div>
                      <p className="text-gray-700">{feedback.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* 関連教材 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-6">関連教材</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedMaterials.map((material) => (
            <div key={material.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <Link href={`/materials/${material.id}`} className="block h-full">
                <h4 className="font-medium mb-2 hover:text-blue-600">{material.title}</h4>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <span className="mr-3">{material.author_name}</span>
                  <div className="flex text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-xs">
                        {i < Math.floor(material.rating) ? <FaStar /> : <FaRegStar />}
                      </span>
                    ))}
                    <span className="ml-1 text-gray-700 text-xs">{material.rating}</span>
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {material.category === 'business' ? 'ビジネス英語' : 
                     material.category === 'communication' ? 'コミュニケーション' : material.category}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                    {material.difficulty === 'beginner' ? '初級' : 
                     material.difficulty === 'intermediate' ? '中級' : '上級'}
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link 
            href="/materials"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            すべての教材を見る <FaChevronRight className="ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MaterialDetailPage; 