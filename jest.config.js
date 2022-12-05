/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@jjjj_test/(.*)$': '<rootDir>/packages/$1/src',
  },
  // roots: ['<rootDir>', 'src'],
  // modulePaths: ['<rootDir>', 'src'],
  // moduleDirectories: ['<rootDir>', 'node_modules'],
  testTimeout: 100000,
}
