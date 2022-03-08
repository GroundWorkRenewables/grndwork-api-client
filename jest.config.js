module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: './test_js',
  testRegex: '.spec.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};
