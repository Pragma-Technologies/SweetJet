/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>', 'src'],
  modulePaths: ['<rootDir>', 'src'],
  moduleDirectories: ['<rootDir>', 'node_modules'],
  testTimeout: 100000,
}
