/// <reference types="@testing-library/jest-dom" />

import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveStyle(style: Record<string, unknown>): R;
      toHaveClass(className: string): R;
      toHaveAttribute(attr: string, value?: unknown): R;
      toHaveTextContent(text: string | RegExp): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeEmpty(): R;
      toBeInvalid(): R;
      toBeRequired(): R;
      toBeValid(): R;
      toBeChecked(): R;
      toBePartiallyChecked(): R;
      toHaveFocus(): R;
      toHaveValue(value: unknown): R;
      toHaveDisplayValue(value: string | RegExp): R;
      toBeEmptyDOMElement(): R;
      toContainElement(element: HTMLElement | null): R;
      toContainHTML(html: string): R;
      toHaveAccessibleDescription(description?: string | RegExp): R;
      toHaveAccessibleName(name?: string | RegExp): R;
      toHaveProperty(path: string, value?: unknown): R;
      toHaveLength(length: number): R;
      toHaveBeenCalledWith(...args: unknown[]): R;
      toHaveBeenCalled(): R;
      toBe(expected: unknown): R;
      toEqual(expected: unknown): R;
      toBeDefined(): R;
      toBeNull(): R;
      toBeUndefined(): R;
      toBeTruthy(): R;
      toBeFalsy(): R;
      toBeInstanceOf(expected: Constructor): R;
      toBeGreaterThan(expected: number): R;
      toBeGreaterThanOrEqual(expected: number): R;
      toBeLessThan(expected: number): R;
      toBeLessThanOrEqual(expected: number): R;
      toContain(expected: unknown): R;
      toMatch(expected: string | RegExp): R;
      toThrow(expected?: string | Error | RegExp): R;
      toBeCloseTo(expected: number, precision?: number): R;
      toMatchObject(object: Record<string, unknown>): R;
      toContainEqual(item: unknown): R;
    }

    interface Expect {
      assertions(count: number): void;
    }

    type Constructor = new (...args: unknown[]) => unknown;

    type MockInstance<T = unknown, Y extends unknown[] = unknown[]> = {
      (...args: Y): T;
      mock: MockContext<T, Y>;
      mockClear(): void;
      mockReset(): void;
      mockRestore(): void;
      mockImplementation(fn: (...args: Y) => T): MockInstance<T, Y>;
      mockImplementationOnce(fn: (...args: Y) => T): MockInstance<T, Y>;
      mockName(name: string): MockInstance<T, Y>;
      getMockName(): string;
    };

    function fn(): MockInstance;
    function fn<T = unknown, Y extends unknown[] = unknown[]>(
      implementation?: (...args: Y) => T
    ): MockInstance<T, Y>;
    function spyOn<T extends object, M extends keyof T>(
      object: T,
      method: M
    ): MockInstance<ReturnType<T[M] extends (...args: unknown[]) => unknown ? T[M] : never>, Parameters<T[M] extends (...args: unknown[]) => unknown ? T[M] : never>>;
    function clearAllMocks(): void;
    function resetAllMocks(): void;
    function restoreAllMocks(): void;
    function useFakeTimers(): typeof jest;
    function useRealTimers(): typeof jest;
  }

  interface ExpectStatic {
    arrayContaining(arr: unknown[]): unknown[];
    objectContaining(obj: Record<string, unknown>): Record<string, unknown>;
    stringContaining(str: string): string;
    stringMatching(str: string | RegExp): string;
    assertions(count: number): void;
  }

  interface Promise<T> {
    resolves: unknown;
    rejects: {
      toThrow(expected?: string | Error | RegExp): Promise<void>;
      toThrowError(expected?: string | Error | RegExp): Promise<void>;
    };
  }

  interface Global {
    fetch: jest.MockInstance<Promise<Response>, [input: RequestInfo | URL, init?: RequestInit]>;
    TextEncoder: typeof TextEncoder;
    TextDecoder: typeof TextDecoder;
  }

  let fetch: jest.MockInstance<Promise<Response>, [input: RequestInfo | URL, init?: RequestInit]>;
}

export {};