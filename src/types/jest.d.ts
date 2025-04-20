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
      toHaveAttribute(attr: string, value?: unknown): R;
      toHaveClass(...classNames: string[]): R;
      toHaveFocus(): R;
      toHaveFormValues(values: Record<string, unknown>): R;
      toHaveStyle(css: Record<string, unknown>): R;
      toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace: boolean }): R;
      toHaveValue(value?: string | string[] | number): R;
      toBeInTheDocument(): R;
      toBeVisible(): R;
      toHaveValidationError(field: string, message: string): R;
      toHaveValidationErrors(errors: Record<string, string>): R;
      toBeValidationError(message: string): R;
      toBeFile(): R;
      toBeValidDate(): R;
      toBeValidEmail(): R;
      toBeValidUrl(): R;
      toBeValidUuid(): R;
      toBeValidPhoneNumber(): R;
      toBeValidPostalCode(): R;
      toBeValidCreditCard(): R;
      toBeValidIpAddress(): R;
      toBeValidMacAddress(): R;
      toBeValidLatitude(): R;
      toBeValidLongitude(): R;
      toBeValidPort(): R;
      toBeValidHostname(): R;
      toBeValidPath(): R;
      toBeEmpty(): R;
      toBeEmptyDOMElement(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace: boolean }): R;
      toHaveValue(value?: string | string[] | number): R;
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
      toBeInstanceOf(expected: Function): R;
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
    objectContaining(expected: Record<string, unknown>): unknown;
    stringContaining(expected: string): unknown;
    stringMatching(expected: string | RegExp): unknown;
    arrayContaining(expected: unknown[]): unknown;
    any(constructor: Function): unknown;
    anything(): unknown;
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

  // グローバルなfetch関数の型定義を修正
  let fetch: jest.MockInstance<Promise<Response>, [input: RequestInfo | URL, init?: RequestInit]>;
}

// これにより、Jest.Mockがグローバルスコープに確実に定義されます
interface Mock<T = unknown, Y extends unknown[] = unknown[]> extends Function, jest.MockInstance<T, Y> {}

export {};