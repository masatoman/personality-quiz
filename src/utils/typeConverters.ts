/**
 * データベース型とフロントエンドの型変換ユーティリティ
 */

type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamelCase<U>>}`
  : S;

type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? T extends Lowercase<T>
    ? `${T}${CamelToSnakeCase<U>}`
    : `_${Lowercase<T>}${CamelToSnakeCase<U>}`
  : S;

/**
 * スネークケースのオブジェクトをキャメルケースに変換
 */
export function snakeToCamel<T extends Record<string, any>>(obj: T): { [K in keyof T as SnakeToCamelCase<string & K>]: T[K] } {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const camelKey = key.replace(/_([a-z])/g, (_, p1) => p1.toUpperCase()) as SnakeToCamelCase<string & keyof T>;
    return { ...acc, [camelKey]: value };
  }, {} as { [K in keyof T as SnakeToCamelCase<string & K>]: T[K] });
}

/**
 * キャメルケースのオブジェクトをスネークケースに変換
 */
export function camelToSnake<T extends Record<string, any>>(obj: T): { [K in keyof T as CamelToSnakeCase<string & K>]: T[K] } {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`) as CamelToSnakeCase<string & keyof T>;
    return { ...acc, [snakeKey]: value };
  }, {} as { [K in keyof T as CamelToSnakeCase<string & K>]: T[K] });
} 