/** @type {import("ts-jest/dist/types").InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>', 'src'],
  modulePaths: ['<rootDir>', 'src'],
  moduleDirectories: ['<rootDir>', 'node_modules'],
  moduleNameMapper: {
    '^@pragma-web-utils/(.*)$': '<rootDir>/../$1/src',
  },
  testTimeout: 100000,
}
