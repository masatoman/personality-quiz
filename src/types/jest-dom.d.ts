/// <reference types="jest" />

declare namespace jest {
  interface JestMatchers<R> {
    toBeInTheDocument(): R;
    toBeVisible(): R;
    toHaveTextContent(text: string | RegExp): R;
    toHaveAttribute(attr: string, value?: string): R;
    toHaveClass(className: string): R;
    toHaveStyle(style: Record<string, any>): R;
    toContainElement(element: HTMLElement | null): R;
    toBeDisabled(): R;
    toBeEnabled(): R;
    toBeChecked(): R;
    toBeEmpty(): R;
    toBeFocused(): R;
    toHaveValue(value: string | RegExp): R;
    toHaveDisplayValue(value: string | RegExp): R;
  }
}