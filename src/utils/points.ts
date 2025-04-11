/**
 * ポイントユーティリティ関数
 */

/**
 * ポイントを消費する関数
 * 
 * @param points 消費するポイント数
 * @param actionType アクションタイプ
 * @param options その他のオプション
 * @returns 消費結果
 */
export const consumePoints = async (
  points: number,
  actionType: string,
  options?: {
    referenceId?: string;
    referenceType?: string;
    description?: string;
  }
): Promise<{
  success: boolean;
  consumedPoints?: number;
  remainingPoints?: number;
  error?: string;
  currentPoints?: number;
  requiredPoints?: number;
}> => {
  try {
    const response = await fetch('/api/points/consume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        points,
        actionType,
        ...options,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: result.error || '不明なエラーが発生しました',
        currentPoints: result.currentPoints,
        requiredPoints: result.requiredPoints,
      };
    }

    return {
      success: true,
      consumedPoints: result.consumedPoints,
      remainingPoints: result.remainingPoints,
    };
  } catch (error) {
    console.error('ポイント消費エラー:', error);
    return {
      success: false,
      error: '通信エラーが発生しました',
    };
  }
};

/**
 * ポイント残高を取得する関数
 * 
 * @returns ポイント残高
 */
export const fetchPointsBalance = async (): Promise<{
  success: boolean;
  points?: number;
  error?: string;
}> => {
  try {
    const response = await fetch('/api/points/balance');
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || '不明なエラーが発生しました',
      };
    }
    
    const data = await response.json();
    
    return {
      success: true,
      points: data.points,
    };
  } catch (error) {
    console.error('ポイント残高取得エラー:', error);
    return {
      success: false,
      error: '通信エラーが発生しました',
    };
  }
};

/**
 * ポイント購入アイテムの定義
 */
export const PURCHASABLE_ITEMS = [
  {
    id: 'premium_theme',
    name: 'プレミアムテーマ',
    description: 'アプリの見た目をカスタマイズできる特別なテーマ',
    points: 500,
    category: 'appearance',
  },
  {
    id: 'access_advanced_materials',
    name: '上級者向け教材アクセス',
    description: '上級者向けの教材にアクセスできるようになります',
    points: 300,
    category: 'content',
  },
  {
    id: 'custom_avatar',
    name: 'カスタムアバター',
    description: 'プロフィールに特別なアバターを設定できます',
    points: 200,
    category: 'appearance',
  },
  {
    id: 'remove_ads',
    name: '広告非表示',
    description: 'アプリ内の広告が表示されなくなります（30日間）',
    points: 150,
    category: 'premium',
  },
]; 