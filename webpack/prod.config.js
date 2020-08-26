const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const WriteJsonPlugin = require('write-json-webpack-plugin')
const CreateFileWebpack = require('create-file-webpack')
const DIST = path.resolve(__dirname, '../dist')
const package = Object.assign(require('../package.json'), {
  main: 'index.js',
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
        use: {
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              declaration: false,
              sourceMap: false
            }
          }
        },
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
    new CopyWebpackPlugin({
      patterns: [
        { from: 'README.md', to: 'README.md' },
        { from: 'LICENSE.md', to: 'LICENSE.md' }
      ]
    }),
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

module.exports = [browserConfig]
