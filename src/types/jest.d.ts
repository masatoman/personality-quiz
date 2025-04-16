/// <reference types="@testing-library/jest-dom" />

import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveStyle(style: Record<string, string>): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveClass(...classNames: string[]): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveValue(value: string | number | string[]): R;
      toBeChecked(): R;
      toBePartiallyChecked(): R;
      toHaveFocus(): R;
      toBeEmpty(): R;
      toBeEmptyDOMElement(): R;
      toBeInvalid(): R;
      toBeRequired(): R;
      toBeValid(): R;
      toContainElement(element: HTMLElement | null): R;
      toContainHTML(html: string): R;
      toHaveAccessibleDescription(description?: string | RegExp): R;
      toHaveAccessibleName(name?: string | RegExp): R;
      toHaveDescription(description: string | RegExp): R;
      toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R;
      toHaveErrorMessage(message?: string | RegExp): R;
      toHaveFormValues(values: Record<string, unknown>): R;
      toBeInTheDOM(): R;
      toHaveProperty(keyPath: string, value?: any): R;
      toHaveLength(length: number): R;
      toHaveBeenCalledWith(...args: any[]): R;
      toHaveBeenCalledTimes(count: number): R;
      toHaveBeenCalled(): R;
      toHaveBeenLastCalledWith(...args: any[]): R;
      toHaveBeenNthCalledWith(nthCall: number, ...args: any[]): R;
      toBe(expected: any): R;
      toEqual(expected: any): R;
      toBeDefined(): R;
      toBeNull(): R;
      toBeUndefined(): R;
      toBeTruthy(): R;
      toBeFalsy(): R;
      toBeInstanceOf(expected: any): R;
      toBeGreaterThan(expected: number): R;
      toBeGreaterThanOrEqual(expected: number): R;
      toBeLessThan(expected: number): R;
      toBeLessThanOrEqual(expected: number): R;
      toContain(expected: any): R;
      toMatch(expected: string | RegExp): R;
      toThrow(expected?: string | Error | RegExp): R;
      toBeCloseTo(expected: number, precision?: number): R;
    }

    interface Expect {
      assertions(count: number): void;
    }

    interface MockInstance<T = any, Y extends any[] = any[]> {
      mockReturnValue(value: T): this;
      mockReturnValueOnce(value: T): this;
      mockImplementation(fn: (...args: Y) => T): this;
      mockImplementationOnce(fn: (...args: Y) => T): this;
      mockResolvedValue(value: Awaited<T>): this;
      mockResolvedValueOnce(value: Awaited<T>): this;
      mockRejectedValue(value: any): this;
      mockRejectedValueOnce(value: any): this;
      mockClear(): void;
      mockReset(): void;
      mockRestore(): void;
    }

    function fn(): MockInstance;
    function fn(implementation?: (...args: any[]) => any): MockInstance;
    function spyOn<T extends {}, M extends PropertyKey>(object: T, method: M): MockInstance<any, any[]>;
    function clearAllMocks(): void;
    function resetAllMocks(): void;
    function restoreAllMocks(): void;
    function useFakeTimers(): typeof jest;
    function useRealTimers(): typeof jest;
  }

  interface ExpectStatic {
    objectContaining(expected: object): any;
    stringContaining(expected: string): any;
    stringMatching(expected: string | RegExp): any;
    arrayContaining(expected: any[]): any;
    any(constructor: any): any;
    anything(): any;
    assertions(count: number): void;
  }

  interface Promise<T> {
    resolves: any;
    rejects: {
      toThrow(expected?: string | Error | RegExp): Promise<void>;
      toThrowError(expected?: string | Error | RegExp): Promise<void>;
    };
  }

  interface Global {
    fetch: jest.Mock<Promise<any>> | any;
    TextEncoder: any;
    TextDecoder: any;
  }

  // グローバルなfetch関数の型定義を修正
  let fetch: jest.MockInstance<Promise<any>, [input: string | URL, init?: any]>;
}

// これにより、Jest.Mockがグローバルスコープに確実に定義されます
interface Mock extends Function, jest.MockInstance {}

export {};