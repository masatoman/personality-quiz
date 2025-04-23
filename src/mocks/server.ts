import { setupServer } from 'msw/node';
import { http } from 'msw';
import { handlers } from './handlers';

export const handlers = [
  http.post('*/auth/v1/reset-password-for-email', () => {
    return new Response(
      JSON.stringify({}),
      { status: 200 }
    );
  }),
];

// MSWサーバーのセットアップ
export const server = setupServer(...handlers);

// MSWのセットアップ
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close()); 