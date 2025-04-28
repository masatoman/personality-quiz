import { consumePoints, fetchPointsBalance } from '../points';

describe('consumePoints', () => {
  beforeAll(() => {
    global.fetch = jest.fn();
  });
  afterAll(() => {
    (global.fetch as jest.Mock).mockRestore();
  });

  it('returns success true when API responds ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ consumedPoints: 10, remainingPoints: 90 }),
    });
    const result = await consumePoints(10, 'testAction');
    expect(result).toEqual({ success: true, consumedPoints: 10, remainingPoints: 90 });
  });

  it('returns error details when API responds not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Not enough points', currentPoints: 5, requiredPoints: 10 }),
    });
    const result = await consumePoints(10, 'testAction');
    expect(result).toEqual({ success: false, error: 'Not enough points', currentPoints: 5, requiredPoints: 10 });
  });
});

describe('fetchPointsBalance', () => {
  beforeAll(() => {
    global.fetch = jest.fn();
  });
  afterAll(() => {
    (global.fetch as jest.Mock).mockRestore();
  });

  it('returns points when API responds ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ points: 123 }),
    });
    const result = await fetchPointsBalance();
    expect(result).toEqual({ success: true, points: 123 });
  });

  it('returns error when API responds not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Fetch error' }),
    });
    const result = await fetchPointsBalance();
    expect(result).toEqual({ success: false, error: 'Fetch error' });
  });
}); 