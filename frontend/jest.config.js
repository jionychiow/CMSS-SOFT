module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(axios|react-router|react-router-dom|@mui))',
  ],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
};