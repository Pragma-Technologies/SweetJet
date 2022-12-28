/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>', 'src'],
  modulePaths: ['<rootDir>', 'src'],
  moduleDirectories: ['<rootDir>', 'node_modules'],
  testTimeout: 100000,
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.jest.json',
    },
  },
}
