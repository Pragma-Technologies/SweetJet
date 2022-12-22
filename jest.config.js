/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@pragma-web-utils/(.*)$': '<rootDir>/packages/$1/src',
  },
  testTimeout: 100000,
}
