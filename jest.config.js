module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: './test_ts',
  testRegex: '.spec.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};
