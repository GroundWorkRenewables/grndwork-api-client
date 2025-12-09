module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '/test_[^/]+.ts$',
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        diagnostics: {
          ignoreCodes: [151002],
        },
      },
    ],
  },
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};
