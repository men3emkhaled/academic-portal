const request = require('supertest');

jest.mock('../middleware/rateLimiter', () => {
  const mockLimiter = (req, res, next) => next();
  return {
    standardLimiter: mockLimiter,
    studentLoginLimiter: mockLimiter,
    adminLoginLimiter: mockLimiter,
    doctorLoginLimiter: mockLimiter,
    forgotPasswordLimiter: mockLimiter,
    inquiriesLimiter: mockLimiter,
    courseRegisterLimiter: mockLimiter,
    registerBulkLimiter: mockLimiter,
    uploadLimiter: mockLimiter,
    studentCreationLimiter: mockLimiter,
  };
});

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

describe('Protected routes — no auth', () => {
  let server;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.PORT = '0';
    process.env.NODE_ENV = 'test';
    server = require('../server');
  });

  afterAll((done) => {
    server.close(done);
  });

  it('GET /api/admin/stats should return 401 without token', async () => {
    const res = await request(server).get('/api/admin/stats');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/student/me should return 401 without token', async () => {
    const res = await request(server).get('/api/student/me');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/doctor/stats should return 401 without token', async () => {
    const res = await request(server).get('/api/doctor/stats');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/ta/profile should return 401 without token', async () => {
    const res = await request(server).get('/api/ta/profile');
    expect(res.statusCode).toBe(401);
  });
});
