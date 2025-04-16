/// <reference types="@testing-library/jest-dom" />

import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveStyle(style: Record<string, unknown>): R;
      toHaveClass(...classNames: string[]): R;
      toHaveAttribute(attr: string, value?: unknown): R;
      toHaveTextContent(text: string | RegExp): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toHaveValue(value: unknown): R;
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
      toHaveDescription(text?: string | RegExp): R;
      toHaveDisplayValue(value: string | RegExp | Array<string | RegExp>): R;
      toHaveErrorMessage(text?: string | RegExp): R;
      toHaveFormValues(values: Record<string, unknown>): R;
      toBeInTheDOM(): R;
      toHaveStyle(css: Record<string, any>): R;
      toHaveProperty(keyPath: string, value?: unknown): R;
      toHaveLength(length: number): R;
      toHaveBeenCalledWith(...args: unknown[]): R;
      toHaveBeenCalledTimes(count: number): R;
      toHaveBeenCalled(): R;
      toHaveBeenLastCalledWith(...args: unknown[]): R;
      toHaveBeenNthCalledWith(nthCall: number, ...args: unknown[]): R;
      toBe(expected: unknown): R;
      toEqual(expected: unknown): R;
      toBeDefined(): R;
      toBeNull(): R;
      toBeUndefined(): R;
      toBeTruthy(): R;
      toBeFalsy(): R;
      toBeInstanceOf(expected: unknown): R;
      toBeGreaterThan(expected: number): R;
      toBeGreaterThanOrEqual(expected: number): R;
      toBeLessThan(expected: number): R;
      toBeLessThanOrEqual(expected: number): R;
      toContain(expected: unknown): R;
      toMatch(expected: string | RegExp): R;
      toThrow(expected?: string | Error | RegExp): R;
      toBeCloseTo(expected: number, precision?: number): R;
    }

    interface Expect {
      assertions(count: number): void;
    }

    interface MockInstance<T = unknown, Y extends unknown[] = unknown[]> {
      mockReturnValue(value: T): this;
      mockReturnValueOnce(value: T): this;
      mockImplementation(fn: (...args: Y) => T): this;
      mockImplementationOnce(fn: (...args: Y) => T): this;
      mockResolvedValue(value: Awaited<T>): this;
      mockResolvedValueOnce(value: Awaited<T>): this;
      mockRejectedValue(value: unknown): this;
      mockRejectedValueOnce(value: unknown): this;
      mockClear(): void;
      mockReset(): void;
      mockRestore(): void;
    }

    function fn(): MockInstance;
    function fn(implementation?: (...args: unknown[]) => unknown): MockInstance;
    function spyOn<T extends object, M extends keyof T>(object: T, method: M): MockInstance<unknown, unknown[]>;
    function clearAllMocks(): void;
    function resetAllMocks(): void;
    function restoreAllMocks(): void;
    function useFakeTimers(): typeof jest;
    function useRealTimers(): typeof jest;
  }

  interface ExpectStatic {
    objectContaining(expected: object): unknown;
    stringContaining(expected: string): unknown;
    stringMatching(expected: string | RegExp): unknown;
    arrayContaining(expected: unknown[]): unknown;
    any(constructor: unknown): unknown;
    anything(): unknown;
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
    fetch: jest.Mock<Promise<unknown>>;
    TextEncoder: typeof TextEncoder;
    TextDecoder: typeof TextDecoder;
  }

  let fetch: jest.MockInstance<Promise<unknown>, [input: string | URL, init?: RequestInit]>;
}

interface Mock<T = unknown> extends jest.MockInstance<T, unknown[]> {
  (...args: unknown[]): T;
}

export {};