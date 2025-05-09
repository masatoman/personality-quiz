import fs from 'fs';
import path from 'path';
import { PersonalityType, Stats } from '@/types/quiz';
import { Pool, PoolClient } from 'pg';

// PostgreSQLの接続プール設定
export let pool: Pool;

// 再接続の試行回数とタイムアウト設定
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2秒
let isConnecting = false;
let lastConnectAttempt = 0;

// 接続設定
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  ssl: process.env.NODE_ENV === 'production' 
    ? {
        rejectUnauthorized: false
      }
    : false,
  // 接続タイムアウトを15秒に設定（短縮）
  connectionTimeoutMillis: 15000,
  // アイドル接続のタイムアウトを10秒に設定（調整）
  idleTimeoutMillis: 10000,
  // 最大接続数を5に設定（調整）
  max: 5,
  // 最小プールサイズを1に設定（調整）
  min: 1
};

// シングルトンパターンで接続プールを管理
let poolInstance: Pool | null = null;

// プールの初期化関数
export async function initPool() {
  try {
    const now = Date.now();
    
    // 接続頻度を制限（最低1秒間隔）
    if (isConnecting || (now - lastConnectAttempt < 1000)) {
      console.log('接続試行中または直近で試行済みのため、重複接続を防止します');
      return pool;
    }
    
    isConnecting = true;
    lastConnectAttempt = now;
    
    if (!poolInstance) {
      console.log('データベースプールを初期化します...');
      
      poolInstance = new Pool({
        ...dbConfig,
        // エラー発生時に自動的に接続を破棄して再接続
        allowExitOnIdle: true
      });
      
      // エラーイベントのハンドリング
      poolInstance.on('error', (err: Error) => {
        console.error('PostgreSQL接続エラー:', {
          message: err.message,
          stack: err.stack,
          code: (err as any).code,
          detail: (err as any).detail
        });
        
        // 致命的なエラーの場合はプールを再作成
        if ((err as any).code === 'ECONNREFUSED' || 
            (err as any).code === 'PROTOCOL_CONNECTION_LOST' ||
            (err as any).code === '57P01') { // PostgreSQL: データベース管理者によって接続が終了
          console.log('致命的なエラーが発生したため、プールを再作成します');
          cleanupPool();
        }
      });

      // プール状態の監視
      poolInstance.on('connect', (client: PoolClient) => {
        console.log('新しい接続が確立されました');
        client.on('error', (err: Error) => {
          console.error('クライアント接続エラー:', err.message);
        });
      });

      // 接続テスト
      try {
        console.log('接続テストを実行します...');
        const client = await poolInstance.connect();
        try {
          await client.query('SELECT 1 as connection_test');
          console.log('データベース接続テスト成功');
        } finally {
          client.release();
        }
      } catch (testError) {
        console.error('接続テストに失敗しました:', testError);
        cleanupPool();
        throw new Error('データベース接続テストに失敗しました');
      }
      
      pool = poolInstance;
    } else {
      console.log('既存のデータベースプールを再利用します');
      pool = poolInstance;
    }
    
    isConnecting = false;
    return pool;
  } catch (error) {
    console.error('PostgreSQLプールの初期化に失敗しました:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as any).code,
      detail: (error as any).detail
    });
    
    isConnecting = false;
    throw error;
  }
}

// プールのクリーンアップ関数
function cleanupPool() {
  if (poolInstance) {
    console.log('データベースプールをクリーンアップします');
    try {
      poolInstance.end()
        .then(() => console.log('プールが正常に終了しました'))
        .catch(err => console.error('プール終了中にエラーが発生しました:', err));
    } catch (error) {
      console.error('プールのクリーンアップ中にエラーが発生しました:', error);
    }
    poolInstance = null;
  }
}

// リトライロジックを含むクエリ実行関数
export async function query(text: string, params?: any[], retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // プールが未初期化の場合は初期化
      if (!pool) {
        await initPool();
      }

      // パフォーマンス計測開始
      const startTime = Date.now();
      let client: PoolClient | null = null;
      
      try {
        // コネクションプールからクライアントを取得
        client = await pool.connect();
        
        // クエリタイムアウトを設定（30秒）
        await client.query('SET statement_timeout = 30000');
        
        // クエリを実行
        const result = await client.query(text, params);
        
        // パフォーマンス計測終了と記録
        const executionTime = Date.now() - startTime;
        if (executionTime > 1000) { // 1秒以上かかったクエリをログ
          console.warn('スロークエリ検出:', {
            query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
            executionTime,
            timestamp: new Date().toISOString()
          });
        }
        
        return result;
      } finally {
        if (client) {
          client.release();
        }
      }
    } catch (error) {
      const isLastAttempt = attempt === retries;
      const shouldRetry = 
        ((error as any).code === 'ECONNREFUSED' || 
         (error as any).code === '08006' || // PostgreSQL: 接続の喪失
         (error as any).code === '57P01');  // PostgreSQL: データベース管理者によって接続が終了
      
      console.error(`クエリ実行エラー (試行 ${attempt}/${retries}):`, error);
      
      if (!isLastAttempt && shouldRetry) {
        console.log(`${RETRY_DELAY}ms後に再試行します...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        
        // エラーが接続関連の場合はプールを再初期化
        cleanupPool();
        continue;
      }
      
      throw error;
    }
  }
  
  throw new Error(`${retries}回の試行後もクエリの実行に失敗しました`);
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