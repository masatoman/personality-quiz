import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * クラス名を結合するユーティリティ関数
 * @param inputs - 結合するクラス名の配列
 * @returns 結合された一意のクラス名文字列
 * @example
 * ```ts
 * cn('text-red-500', 'bg-blue-200', conditional && 'font-bold')
 * // => 'text-red-500 bg-blue-200 font-bold'
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * 日付を日本語形式でフォーマットする
 * @param date - フォーマットする日付オブジェクト
 * @returns 「YYYY年MM月DD日」形式の日付文字列
 * @throws {TypeError} dateがDateオブジェクトでない場合
 * @example
 * ```ts
 * formatDate(new Date('2024-03-15'))
 * // => '2024年3月15日'
 * ```
 */
export function formatDate(date: Date): string {
  if (!(date instanceof Date)) {
    throw new TypeError('引数はDateオブジェクトである必要があります');
  }
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

/**
 * 入力文字列が空でないかチェックする
 * @param input - 検証する文字列
 * @returns 文字列が空でない場合はtrue、空白文字のみまたは空の場合はfalse
 * @example
 * ```ts
 * validateInput('  ') // => false
 * validateInput('テスト') // => true
 * ```
 */
export function validateInput(input: string): boolean {
  if (typeof input !== 'string') {
    return false;
  }
  return input.trim().length > 0;
}

/**
 * ランダムなIDを生成する
 * @returns ランダムな13文字の英数字文字列
 * @example
 * ```ts
 * generateId() // => 'a1b2c3d4e5f6g'
 * ```
 */
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 7);
  return `${timestamp}${randomStr}`;
}

/**
 * 指定された範囲内の乱数を生成する
 * @param min - 最小値（含む）
 * @param max - 最大値（含む）
 * @returns min以上max以下の整数
 * @throws {Error} minがmaxより大きい場合
 * @example
 * ```ts
 * getRandomInt(1, 10) // => 5
 * ```
 */
export function getRandomInt(min: number, max: number): number {
  if (min > max) {
    throw new Error('最小値は最大値以下である必要があります');
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 配列をランダムにシャッフルする
 * @param array - シャッフルする配列
 * @returns シャッフルされた新しい配列
 * @example
 * ```ts
 * shuffleArray([1, 2, 3, 4, 5])
 * // => [3, 1, 5, 2, 4]
 * ```
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
} 