const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

module.exports = {
  mode: 'development',
  target: 'web',
  entry: './dev/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          compilerOptions: {
            target: 'es2017',
            module: 'commonjs'
          }
        }
      }
    ]
  },
  resolve: {
    alias: {
      buffer: 'buffer'
    },
    extensions: ['.tsx', '.ts', '.js']
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dev',
    hot: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './dev/index.html'
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer']
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  output: {
    filename: 'index.js',
    libraryTarget: 'umd',
    library: 'Metrics'
  }
}
