module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  testMatch: [
    '<rootDir>/test/**/*.test.js',
  ],
  collectCoverageFrom: [
    'workers/**/*.js',
    'index.js',
    '!**/node_modules/**',
  ],
  coverageReporters: [
    'text',
    'lcov',
    'html',
  ],
};
