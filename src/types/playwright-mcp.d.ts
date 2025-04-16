declare module 'playwright-mcp' {
  import { PlaywrightTestConfig } from '@playwright/test';

  export const mcp: {
    navigate: (url: string) => Promise<void>;
    click: (options: { element: string; ref: string }) => Promise<void>;
    type: (options: { element: string; ref: string; text: string; slowly?: boolean; submit?: boolean }) => Promise<void>;
    press: (key: string) => Promise<void>;
    snapshot: () => Promise<void>;
    setViewportSize: (size: { width: number; height: number }) => Promise<void>;
    hover: (options: { element: string; ref: string }) => Promise<void>;
    selectOption: (options: { element: string; ref: string; values: string[] }) => Promise<void>;
    fileUpload: (paths: string[]) => Promise<void>;
    wait: (time: number) => Promise<void>;
    close: () => Promise<void>;
  };

  export const mcpConfig: Partial<PlaywrightTestConfig['use']>;
} 