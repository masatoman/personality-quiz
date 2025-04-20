/// <reference types="@testing-library/jest-dom" />

declare global {
  namespace jest {
    interface Matchers<R> {
      // DOM要素の存在確認
      toBeInTheDocument(): R;
      toBeVisible(): R;
      toBeEmpty(): R;
      toBeEmptyDOMElement(): R;

      // 属性と値の確認
      toHaveAttribute(attr: string, value?: string): R;
      toHaveClass(className: string): R;
      toHaveStyle(css: Record<string, unknown>): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveValue(value: string | string[] | number): R;

      // フォーム要素の状態確認
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeRequired(): R;
      toBeChecked(): R;
      toBePartiallyChecked(): R;
      toHaveFormValues(values: Record<string, any>): R;
      toBeValid(): R;
      toBeInvalid(): R;

      // アクセシビリティ
      toHaveDescription(text: string | RegExp): R;

      // その他のDOM関連マッチャー
      toContainElement(element: HTMLElement | null): R;
      toContainHTML(html: string): R;
      toHaveFocus(): R;
      toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R;
    }
  }
} 