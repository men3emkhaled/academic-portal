const request = require('supertest');

jest.mock('../utils/cache', () => ({
  redis: { ping: jest.fn().mockResolvedValue('PONG'), on: jest.fn() },
  getCache: jest.fn().mockResolvedValue(null),
  setCache: jest.fn(),
  deleteCache: jest.fn(),
  clearCachePattern: jest.fn(),
}));

jest.mock('../config/database', () => ({
  query: jest.fn().mockResolvedValue({ rows: [{ '?column?': 1 }] }),
  pool: { on: jest.fn() },
  getActiveSemester: jest.fn().mockResolvedValue(2),
}));

describe('Rate limiting enforcement', () => {
  let server;

  beforeAll(() => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'test-secret';
    process.env.ADMIN_USERNAME = 'admin';
    process.env.ADMIN_PASSWORD = 'correctpassword';
    process.env.PORT = '0';

    jest.resetModules();
    server = require('../server');
  });

  afterAll((done) => {
    if (server && server.close) server.close(done);
    else done();
  });

  it('admin login should hit rate limit after too many failures', async () => {
    const loginPayload = { username: 'admin', password: 'wrong' };

    for (let i = 0; i < 4; i++) {
      const res = await request(server)
        .post('/api/admin/login')
        .send(loginPayload)
        .set('Content-Type', 'application/json');

      if (i < 3) {
        expect([401, 429]).toContain(res.statusCode);
      } else {
        expect(res.statusCode).toBe(429);
      }
    }
  }, 15000);

  it('standard limiter allows requests under threshold', async () => {
    const promises = [];
    for (let i = 0; i < 15; i++) {
      promises.push(request(server).get('/api/health'));
    }
    const results = await Promise.all(promises);
    const rateLimited = results.filter(r => r.statusCode === 429);
    expect(rateLimited.length).toBe(0);
  });
});
