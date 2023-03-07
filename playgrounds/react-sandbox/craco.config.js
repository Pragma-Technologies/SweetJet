/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const { getLoader, loaderByName } = require('@craco/craco')

const srcPath = path.join(__dirname, './src')
const rootPath = path.join(__dirname, '../..')

module.exports = {
  devServer: {
    port: 3002,
  },
  webpack: {
    configure: (webpackConfig) => {
      const { match } = getLoader(webpackConfig, loaderByName('babel-loader'))
      match.loader.include = [srcPath, rootPath]
      return webpackConfig
    },
  },
}
