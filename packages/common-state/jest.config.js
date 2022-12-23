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
      extends: './tsconfig.json',
      compilerOptions: {
        outDir: './dist',
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        allowSyntheticDefaultImports: true,
        noFallthroughCasesInSwitch: true,
        module: 'esnext',
        isolatedModules: true,
        jsx: 'react-jsx',
        noEmit: true,
      },
    },
  },
}
