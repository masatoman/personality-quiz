import fs from 'fs';
import path from 'path';
import { Pool, PoolClient, QueryResult as PgQueryResult } from 'pg';
import { DatabaseError, FileSystemError } from '@/types/errors';

// PostgreSQLの接続プール設定
export let pool: Pool | null = null;

// 拡張されたクエリ結果の型定義
export interface QueryResult<T> extends Omit<PgQueryResult, 'rows'> {
  rows: T[];
}

// PostgreSQLエラーの型定義
interface PostgresError extends Error {
  code: string;
  detail?: string;
  position?: string;
  schema?: string;
  table?: string;
  column?: string;
  dataType?: string;
  constraint?: string;
}

// データベース設定の型定義
interface DbConfig {
  host: string | undefined;
  user: string | undefined;
  password: string | undefined;
  database: string | undefined;
  ssl: boolean | { rejectUnauthorized: boolean };
  connectionTimeoutMillis: number;
  idleTimeoutMillis: number;
  max: number;
  min: number;
  maxUses: number;
}

// 接続設定
const dbConfig: DbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false }
    : false,
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 5000,
  max: 10,
  min: 2,
  maxUses: 5
};

/**
 * エラーがPostgreSQLエラーかどうかを判定する型ガード関数
 */
function isPostgresError(error: unknown): error is PostgresError {
  return error instanceof Error && 'code' in error && typeof (error as PostgresError).code === 'string';
}

/**
 * データベースプールを初期化する
 * @returns 初期化されたプール
 * @throws {DatabaseError} プールの初期化に失敗した場合
 */
export async function initPool(): Promise<Pool> {
  try {
    if (!pool) {
      console.log('データベースプールを初期化します...');
      pool = new Pool(dbConfig);
      
      pool.on('error', (err: Error, client: PoolClient) => {
        if (isPostgresError(err)) {
          console.error('PostgreSQL接続エラー:', {
            message: err.message,
            stack: err.stack,
            code: err.code,
            detail: err.detail,
            position: err.position,
            schema: err.schema,
            table: err.table
          });
        } else {
          console.error('不明なデータベースエラー:', err);
        }
        if (client) {
          client.release(true);
        }
      });

      pool.on('connect', () => {
        console.log('新しい接続が確立されました');
      });

      const client = await pool.connect();
      try {
        const result = await client.query<{ now: Date }>('SELECT NOW()');
        console.log('データベース接続テスト成功:', result.rows[0].now);
        
        const poolStatus = await client.query<{ connection_count: number }>(
          `SELECT count(*) as connection_count 
           FROM pg_stat_activity 
           WHERE datname = $1`,
          [process.env.DB_NAME]
        );
        console.log('アクティブな接続数:', poolStatus.rows[0].connection_count);
      } finally {
        client.release();
      }
    }
    
    if (!pool) {
      throw new DatabaseError('プールの初期化に失敗しました');
    }
    
    return pool;
  } catch (error: unknown) {
    if (isPostgresError(error)) {
      console.error('PostgreSQLプールの初期化に失敗しました:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
        detail: error.detail
      });
    } else {
      console.error('不明なデータベースエラー:', error);
    }
    throw new DatabaseError(
      `データベース接続エラー: ${error instanceof Error ? error.message : '不明なエラー'}`
    );
  }
}

// キャッシュエントリの型定義
interface CacheEntry<T> {
  data: QueryResult<T>;
  timestamp: number;
}

// クエリ結果のキャッシュ管理
const queryCache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 5 * 60 * 1000; // 5分

/**
 * キャッシュを使用してクエリを実行する
 * @param text - SQLクエリ文
 * @param params - クエリパラメータ
 * @param ttl - キャッシュの有効期限（ミリ秒）
 * @returns クエリ結果
 * @throws {DatabaseError} クエリの実行に失敗した場合
 */
export async function cachedQuery<T>(
  text: string,
  params?: unknown[],
  ttl: number = CACHE_TTL
): Promise<QueryResult<T>> {
  const cacheKey = `${text}-${JSON.stringify(params)}`;
  const cached = queryCache.get(cacheKey) as CacheEntry<T> | undefined;
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  
  const result = await query<T>(text, params);
  queryCache.set(cacheKey, {
    data: result,
    timestamp: Date.now()
  });
  
  return result;
}

/**
 * バッチ処理でクエリを実行する
 * @param items - 処理するアイテムの配列
 * @param batchSize - バッチサイズ
 * @param queryFn - バッチ処理を行う関数
 * @returns クエリ結果の配列
 */
export async function batchQuery<T, R>(
  items: T[],
  batchSize: number,
  queryFn: (batch: T[]) => Promise<QueryResult<R>>
): Promise<QueryResult<R>[]> {
  const results: QueryResult<R>[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await queryFn(batch);
    results.push(batchResults);
    
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

/**
 * クエリを実行する
 * @param text - SQLクエリ文
 * @param params - クエリパラメータ
 * @returns クエリ結果
 * @throws {DatabaseError} クエリの実行に失敗した場合
 */
export async function query<T>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  if (!pool) {
    await initPool();
  }
  
  if (!pool) {
    throw new DatabaseError('データベースプールが初期化されていません');
  }

  try {
    const result = await pool.query(text, params);
    return result as QueryResult<T>;
  } catch (error: unknown) {
    if (isPostgresError(error)) {
      throw new DatabaseError(
        `クエリ実行エラー: ${error.message} (コード: ${error.code}, 詳細: ${error.detail})`
      );
    }
    throw new DatabaseError(
      `クエリ実行エラー: ${error instanceof Error ? error.message : '不明なエラー'}`
    );
  }
}

/**
 * トランザクションを実行する
 * @param callback - トランザクション内で実行する処理
 * @returns トランザクションの実行結果
 * @throws {DatabaseError} トランザクションの実行に失敗した場合
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  if (!pool) {
    await initPool();
  }

  if (!pool) {
    throw new DatabaseError('データベースプールが初期化されていません');
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    if (isPostgresError(error)) {
      throw new DatabaseError(
        `トランザクションエラー: ${error.message} (コード: ${error.code}, 詳細: ${error.detail})`
      );
    }
    throw new DatabaseError(
      `トランザクションエラー: ${error instanceof Error ? error.message : '不明なエラー'}`
    );
  } finally {
    client.release();
  }
}

/**
 * データベースを初期化する
 * @param sqlFilePath - SQLファイルのパス
 * @throws {DatabaseError} データベースの初期化に失敗した場合
 * @throws {FileSystemError} SQLファイルの読み込みに失敗した場合
 */
export async function initDatabase(sqlFilePath: string): Promise<void> {
  try {
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    await query(sql);
    console.log('データベースを初期化しました');
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      throw new FileSystemError(`SQLファイルが見つかりません: ${sqlFilePath}`);
    }
    if (isPostgresError(error)) {
      throw new DatabaseError(
        `データベース初期化エラー: ${error.message} (コード: ${error.code}, 詳細: ${error.detail})`
      );
    }
    throw new DatabaseError(
      `データベース初期化エラー: ${error instanceof Error ? error.message : '不明なエラー'}`
    );
  }
} 