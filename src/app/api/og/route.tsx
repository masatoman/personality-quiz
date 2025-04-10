import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // 画像のタイプを取得（デフォルトは'top'）
  const type = searchParams.get('type') || 'top';
  
  // パーソナリティタイプを取得（結果ページ用）
  const personalityType = searchParams.get('personality') || '';
  
  // フォントデータの取得
  const interBold = await fetch(
    new URL('../../../assets/Inter-Bold.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer());
  
  const interRegular = await fetch(
    new URL('../../../assets/Inter-Regular.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer());
  
  // タイプに基づいたコンテンツとスタイルの設定
  let title = 'あなたの英語学習タイプを診断';
  let subtitle = '3分で最適な学習法を発見';
  let bgGradient = 'linear-gradient(135deg, #4F46E5, #7C3AED)';
  
  if (type === 'quiz') {
    title = '英語学習タイプ診断';
    subtitle = '質問に答えてあなたの学習スタイルを発見';
    bgGradient = 'linear-gradient(135deg, #3B82F6, #6366F1)';
  } else if (type === 'results') {
    let typeText = '';
    
    switch(personalityType) {
      case 'giver':
        typeText = '共感型学習者';
        bgGradient = 'linear-gradient(135deg, #4F46E5, #A78BFA)';
        break;
      case 'taker':
        typeText = '没入型学習者';
        bgGradient = 'linear-gradient(135deg, #0EA5E9, #38BDF8)';
        break;
      case 'matcher':
        typeText = '適応型学習者';
        bgGradient = 'linear-gradient(135deg, #10B981, #34D399)';
        break;
      default:
        typeText = '英語学習タイプ';
    }
    
    title = `あなたは「${typeText}」タイプ`;
    subtitle = '診断結果に基づいた最適な学習法を発見';
  }
  
  // OG画像の生成
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: bgGradient,
          padding: '40px 60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            color: 'white',
          }}
        >
          <h1
            style={{
              fontSize: 80,
              fontWeight: 'bold',
              marginBottom: 16,
              maxWidth: '900px',
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>
          <h2
            style={{
              fontSize: 40,
              opacity: 0.9,
              maxWidth: '800px',
            }}
          >
            {subtitle}
          </h2>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 30,
              color: 'white',
              opacity: 0.7,
            }}
          >
            EngType.app
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: interBold,
          style: 'normal',
          weight: 700,
        },
        {
          name: 'Inter',
          data: interRegular,
          style: 'normal',
          weight: 400,
        },
      ],
    },
  );
} 