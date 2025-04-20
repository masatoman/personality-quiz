/**
 * データベース型とフロントエンドの型変換ユーティリティ
 */

import { ActivityType } from '../types/activity';

// 共通の型定義
type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

/**
 * 文字列を大文字のスネークケースに変換
 */
export function convertToUpperSnakeCase(str: string): string {
  return str
    .split(/(?=[A-Z])/)
    .join('_')
    .toUpperCase();
}

/**
 * ActivityTypeを文字列に変換
 */
export function convertActivityType(type: ActivityType): string {
  return convertToUpperSnakeCase(type as string);
}

/**
 * 文字列をローワーキャメルケースに変換
 */
export function convertToLowerCamelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * スネークケースのオブジェクトをキャメルケースに変換します
 */
export function snakeToCamel<T extends JsonObject>(obj: T): T {
  const newObj = {} as T;
  Object.entries(obj).forEach(([key, value]) => {
    const newKey = convertToLowerCamelCase(key);
    newObj[newKey as keyof T] = value;
  });
  return newObj;
}

/**
 * キャメルケースのオブジェクトをスネークケースに変換します
 */
export function camelToSnake<T extends JsonObject>(obj: T): T {
  const newObj = {} as T;
  Object.entries(obj).forEach(([key, value]) => {
    const newKey = key.replace(/[A-Z]/g, (g) => `_${g.toLowerCase()}`);
    newObj[newKey as keyof T] = value;
  });
  return newObj;
} 