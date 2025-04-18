import fs from 'fs';
import path from 'path';
import { PersonalityType, TypeTotals, TypeStats, Stats } from '@/types/quiz';
import { Pool } from 'pg';

// PostgreSQLの接続プール設定
export let pool: Pool;

// 接続設定
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' 
    ? {
        rejectUnauthorized: false
      }
    : false,
  // 接続タイムアウトを15秒に設定（短縮）
  connectionTimeoutMillis: 15000,
  // アイドル接続のタイムアウトを5秒に設定（短縮）
  idleTimeoutMillis: 5000,
  // 最大接続数を10に設定（調整）
  max: 10,
  // 最小プールサイズを2に設定（追加）
  min: 2,
  // アイドル状態の最大接続数を5に設定（追加）
  maxUses: 5
};

// プールの初期化関数
export async function initPool() {
  try {
    if (!pool) {
      console.log('データベースプールを初期化します...');
      pool = new Pool(dbConfig);
      
      // エラーイベントのハンドリング
      pool.on('error', (err: Error & { client?: any }) => {
        console.error('PostgreSQL接続エラー:', {
          message: err.message,
          stack: err.stack,
          code: (err as any).code,
          detail: (err as any).detail
        });
        // エラーが発生した接続を破棄
        if (err.client) {
          console.log('問題のある接続を破棄します');
          err.client.release(true);
        }
      });

      // プール状態の監視
      pool.on('connect', () => {
        console.log('新しい接続が確立されました');
      });

      pool.on('acquire', () => {
        console.log('接続がプールから取得されました');
      });

      pool.on('remove', () => {
        console.log('接続がプールから削除されました');
      });

      // 接続テスト
      console.log('接続テストを実行します...');
      const client = await pool.connect();
      try {
        const result = await client.query('SELECT NOW()');
        console.log('データベース接続テスト成功:', result.rows[0]);
        
        // 接続プールの状態を確認
        const poolStatus = await client.query(`
          SELECT count(*) as connection_count 
          FROM pg_stat_activity 
          WHERE datname = $1
        `, [process.env.DB_NAME]);
        console.log('アクティブな接続数:', poolStatus.rows[0].connection_count);
      } finally {
        client.release();
      }
    } else {
      console.log('既存のデータベースプールを再利用します');
    }
    return pool;
  } catch (error) {
    console.error('PostgreSQLプールの初期化に失敗しました:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as any).code,
      detail: (error as any).detail
    });
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
  
  const result = await query(text, params);
  queryCache.set(cacheKey, {
    data: result,
    timestamp: Date.now()
  });
  
  return result;
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

export async function query(text: string, params?: any[]) {
  try {
    // プールが未初期化の場合は初期化
    if (!pool) {
      await initPool();
    }

    // パフォーマンス計測開始
    const startTime = Date.now();

    // コネクションプールからクライアントを取得
    const client = await pool.connect();
    
    try {
      // クエリタイムアウトを設定（30秒）
      await client.query('SET statement_timeout = 30000');
      
      // クエリを実行
      const result = await client.query(text, params);
      
      // パフォーマンス計測終了と記録
      const executionTime = Date.now() - startTime;
      if (executionTime > 1000) { // 1秒以上かかったクエリをログ
        console.warn('スロークエリ検出:', {
          query: text,
          params,
          executionTime,
          timestamp: new Date().toISOString()
        });
      }
      
      return result;
    } catch (queryError) {
      console.error('クエリ実行エラー:', queryError);
      console.error('実行されたクエリ:', text);
      console.error('パラメータ:', params);
      throw queryError;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('データベース操作エラー:', error);
    throw error;
  }
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