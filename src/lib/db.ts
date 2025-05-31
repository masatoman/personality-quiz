import fs from 'fs';
import path from 'path';
import { PersonalityType, Stats } from '@/types/quiz';
import { createClient } from '@supabase/supabase-js';

// Supabaseクライアントの初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseClient: any = null;

// Supabaseクライアントの初期化
function getSupabaseClient() {
  if (!supabaseClient) {
    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('Supabase設定が不完全です。ローカルファイルモードを使用します。');
      return null;
    }
    
    try {
      supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
      console.log('Supabaseクライアントを初期化しました');
    } catch (error) {
      console.error('Supabaseクライアント初期化エラー:', error);
      return null;
    }
  }
  return supabaseClient;
}

// 互換性のためのレガシー関数（PostgreSQL接続は無効化）
export async function initPool() {
  console.log('PostgreSQL接続はSupabaseに移行されました。Supabaseクライアントを初期化します。');
  return getSupabaseClient();
}

// Supabaseクエリ実行関数
export async function query(text: string, params?: any[], retries = 3) {
  const client = getSupabaseClient();
  
  if (!client) {
    throw new Error('Supabase接続が利用できません。ローカルファイルフォールバック。');
  }

  try {
    // 基本的なSELECTクエリの場合はSupabaseのrpcまたはクエリに変換
    console.log('クエリ実行:', text.substring(0, 100));
    
    // この関数は主にローカルファイル保存のフォールバック用として使用
    // 実際のデータベース操作は各APIで適切なSupabaseメソッドを使用
    return { rows: [], rowCount: 0 };
  } catch (error) {
    console.error('Supabaseクエリエラー:', error);
    throw error;
  }
}

// クエリ結果のキャッシュ管理
const queryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5分

// キャッシュを使用するクエリ実行関数
export async function cachedQuery(text: string, params?: any[], ttl: number = CACHE_TTL) {
  const cacheKey = `${text}-${JSON.stringify(params)}`;
  const cached = queryCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  
  try {
    const result = await query(text, params);
    queryCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    return result;
  } catch (error) {
    // キャッシュがあれば期限切れでも使用
    if (cached) {
      console.log('データベースエラーのため期限切れキャッシュを使用します');
      return cached.data;
    }
    throw error;
  }
}

// バッチ処理用のクエリ実行関数
export async function batchQuery<T>(
  items: T[],
  batchSize: number,
  queryFn: (batch: T[]) => Promise<any>
): Promise<any[]> {
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await queryFn(batch);
    results.push(...batchResults);
    
    // バッチ間で短い遅延を入れる
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

// データベースファイルのパス
const DB_DIR = path.join(process.cwd(), 'data');
const RESULTS_FILE = path.join(DB_DIR, 'results.json');
const STATS_FILE = path.join(DB_DIR, 'stats.json');

// データベースの初期化
export function initDatabase() {
  try {
    console.log(`データディレクトリパス: ${DB_DIR}`);
    console.log(`結果ファイルパス: ${RESULTS_FILE}`);
    console.log(`統計ファイルパス: ${STATS_FILE}`);
    
    // データディレクトリの作成
    if (!fs.existsSync(DB_DIR)) {
      console.log('データディレクトリが存在しないため、作成します');
      try {
        fs.mkdirSync(DB_DIR, { recursive: true });
      } catch (dirError) {
        console.error('データディレクトリの作成に失敗しました:', dirError);
        console.log('代わりにメモリ内のモックデータを使用します');
        return true; // ファイルシステムにアクセスできなくても処理を続行
      }
    }

    // 結果ファイルの作成・確認
    if (!fs.existsSync(RESULTS_FILE)) {
      console.log('結果ファイルが存在しないため、作成します');
      fs.writeFileSync(RESULTS_FILE, JSON.stringify([]), { encoding: 'utf8', mode: 0o666 });
    }

    // 統計ファイルの作成・確認
    if (!fs.existsSync(STATS_FILE)) {
      console.log('統計ファイルが存在しないため、作成します');
      const initialStats: Stats = {
        giver: { count: 0, percentage: 0 },
        matcher: { count: 0, percentage: 0 },
        taker: { count: 0, percentage: 0 },
        total: 0
      };
      fs.writeFileSync(STATS_FILE, JSON.stringify(initialStats), { encoding: 'utf8', mode: 0o666 });
    }
    
    return true;
  } catch (error) {
    console.error('データベースの初期化中にエラーが発生しました:', error);
    if (error instanceof Error) {
      console.error('エラーメッセージ:', error.message);
      console.error('スタックトレース:', error.stack);
    }
    return false;
  }
}

// メモリ内のモックデータ
let mockResults: { id: number; type: PersonalityType; timestamp: string }[] = [];
let mockStats: Stats = {
  giver: { count: 10, percentage: 34 },
  matcher: { count: 7, percentage: 25 },
  taker: { count: 12, percentage: 41 },
  total: 29
};

// 結果の保存
export function saveResult(type: PersonalityType): boolean {
  try {
    // データベースの初期化
    const initSuccess = initDatabase();
    if (!initSuccess) {
      console.log('データベース初期化に失敗しました。メモリ内のモックデータを使用します');
    }

    // ファイルへの保存を試みる
    try {
      console.log(`結果ファイルから読み込みを試行: ${RESULTS_FILE}`);
      // 現在の結果を読み込む
      let resultsData = [];
      try {
        const fileContent = fs.readFileSync(RESULTS_FILE, 'utf-8');
        console.log(`読み込まれたファイル内容: ${fileContent}`);
        resultsData = JSON.parse(fileContent);
      } catch (readError) {
        console.error('結果ファイルの読み込みに失敗しました。新しいファイルを作成します:', readError);
        resultsData = [];
      }
      
      // 新しい結果を追加
      const newResult = {
        id: Date.now(),
        type,
        timestamp: new Date().toISOString()
      };
      resultsData.push(newResult);
      
      console.log(`結果ファイルへの書き込みを試行: ${JSON.stringify(resultsData, null, 2)}`);
      // 結果を保存
      fs.writeFileSync(RESULTS_FILE, JSON.stringify(resultsData, null, 2), { encoding: 'utf8', mode: 0o666 });
      
      // 統計を更新
      const statsSuccess = updateStats(type);
      if (!statsSuccess) {
        throw new Error('統計の更新に失敗しました');
      }
    } catch (fileError) {
      console.error('ファイルへの保存に失敗しました。メモリ内モックデータを更新します:', fileError);
      
      // メモリ内のモックデータを更新
      const newResult = {
        id: Date.now(),
        type,
        timestamp: new Date().toISOString()
      };
      mockResults.push(newResult);
      
      // モックの統計を更新
      mockStats[type].count += 1;
      mockStats.total += 1;
      
      // パーセンテージを再計算
      Object.keys(mockStats).forEach((key) => {
        if (key !== 'total') {
          const personalityType = key as PersonalityType;
          mockStats[personalityType].percentage = 
            Math.round((mockStats[personalityType].count / mockStats.total) * 100);
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error('結果の保存中にエラーが発生しました:', error);
    if (error instanceof Error) {
      console.error('エラーメッセージ:', error.message);
      console.error('スタックトレース:', error.stack);
    }
    return false;
  }
}

// 統計の更新
function updateStats(type: PersonalityType): boolean {
  try {
    console.log(`統計ファイルから読み込みを試行: ${STATS_FILE}`);
    // 統計データを読み込む
    let statsData: Stats;
    try {
      const fileContent = fs.readFileSync(STATS_FILE, 'utf-8');
      console.log(`読み込まれた統計ファイル内容: ${fileContent}`);
      statsData = JSON.parse(fileContent);
    } catch (readError) {
      console.error('統計ファイルの読み込みに失敗しました。新しい統計を作成します:', readError);
      statsData = {
        giver: { count: 0, percentage: 0 },
        matcher: { count: 0, percentage: 0 },
        taker: { count: 0, percentage: 0 },
        total: 0
      };
    }
    
    // カウントを増やす
    statsData[type].count += 1;
    statsData.total += 1;
    
    // パーセンテージを再計算
    const total = statsData.total;
    Object.keys(statsData).forEach((key) => {
      if (key !== 'total') {
        const personalityType = key as PersonalityType;
        statsData[personalityType].percentage = 
          Math.round((statsData[personalityType].count / total) * 100);
      }
    });
    
    console.log(`統計ファイルへの書き込みを試行: ${JSON.stringify(statsData, null, 2)}`);
    // 統計を保存
    fs.writeFileSync(STATS_FILE, JSON.stringify(statsData, null, 2), { encoding: 'utf8', mode: 0o666 });
    return true;
  } catch (error) {
    console.error('統計の更新中にエラーが発生しました:', error);
    if (error instanceof Error) {
      console.error('エラーメッセージ:', error.message);
      console.error('スタックトレース:', error.stack);
    }
    return false;
  }
}

// 統計の取得
export function getStats(): Stats {
  try {
    // データベースの初期化
    const initSuccess = initDatabase();
    if (!initSuccess) {
      console.log('データベース初期化に失敗しました。メモリ内のモックデータを使用します');
      return mockStats;
    }
    
    // ファイルからの読み込みを試みる
    try {
      console.log(`統計ファイルから読み込みを試行: ${STATS_FILE}`);
      const fileContent = fs.readFileSync(STATS_FILE, 'utf-8');
      console.log(`読み込まれた統計ファイル内容: ${fileContent}`);
      return JSON.parse(fileContent);
    } catch (readError) {
      console.error('統計ファイルの読み込みに失敗しました。メモリ内モックデータを返します:', readError);
      return mockStats;
    }
  } catch (error) {
    console.error('統計の取得中にエラーが発生しました:', error);
    if (error instanceof Error) {
      console.error('エラーメッセージ:', error.message);
      console.error('スタックトレース:', error.stack);
    }
    
    // エラー時はモックデータを返す
    return mockStats;
  }
} 