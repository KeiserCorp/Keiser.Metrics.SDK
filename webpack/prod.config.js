const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const WriteJsonPlugin = require('write-json-webpack-plugin')
const CreateFileWebpack = require('create-file-webpack')
const DIST = path.resolve(__dirname, '../dist')
const package = Object.assign(require('../package.json'), {
  main: 'index.node.js',
  browser: 'index.browser.js',
  types: 'index.d.ts',
  private: false,
  devDependencies: {},
  scripts: {}
})

const baseConfig = {
  mode: 'production',
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  }
}

const browserConfig = {
  ...baseConfig,
  target: 'web',
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [DIST],
      cleanAfterEveryBuildPatterns: []
    }),
    new CopyWebpackPlugin([{ from: 'README.md', to: 'README.md' }]),
    new CopyWebpackPlugin([{ from: 'LICENSE.md', to: 'LICENSE.md' }]),
    new CreateFileWebpack({
      path: './dist',
      fileName: '.npmrc',
      content: '//registry.npmjs.org/:_authToken=${NPM_TOKEN}'
    }),
    new WriteJsonPlugin({
      object: package,
      filename: 'package.json',
      pretty: true
    })
  ],
  output: {
    filename: 'index.browser.js',
    path: DIST,
    libraryTarget: 'umd',
    library: 'Metrics'
  }
}

const nodeConfig = {
  ...baseConfig,
  target: 'node',
  output: {
    filename: 'index.node.js',
    path: DIST,
    libraryTarget: 'umd',
    library: 'Metrics'
  }
}

module.exports = [browserConfig, nodeConfig]
