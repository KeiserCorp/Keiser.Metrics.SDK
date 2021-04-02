const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

module.exports = {
  mode: 'development',
  target: 'web',
  entry: './dev/index.ts',
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
