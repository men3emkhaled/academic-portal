module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  maxWorkers: 1,
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    'server.js',
    'config/**/*.js',
    'middleware/**/*.js',
    '!middleware/taCompatibility.js',
    'utils/**/*.js',
    '!utils/logger.js',
  ],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 40,
      lines: 40,
      statements: 40,
    },
  },
  verbose: true,
};
