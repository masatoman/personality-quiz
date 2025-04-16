import { setupServer } from 'msw/node';
import { http } from 'msw';

export const handlers = [
  http.post('*/auth/v1/reset-password-for-email', () => {
    return new Response(
      JSON.stringify({}),
      { status: 200 }
    );
  }),
];

export const server = setupServer(...handlers);

// MSWのセットアップ
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close()); 