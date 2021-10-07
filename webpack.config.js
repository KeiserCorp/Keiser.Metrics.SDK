import HtmlWebpackPlugin from 'html-webpack-plugin'
import webpack from 'webpack'

export default {
  mode: 'development',
  target: 'web',
  entry: './dev/index.ts',
  module: {
    rules: [
      {
        test: /\.worker\.ts$/,
        loader: 'worker-loader'
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          compilerOptions: {
            target: 'esnext',
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
    extensions: ['.ts', '.js']
  },
  devtool: 'inline-source-map',
  devServer: {
    static: {
      directory: './dev'
    },
    hot: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './dev/index.html'
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer']
    })
  ],
  output: {
    filename: 'index.js',
    libraryTarget: 'umd',
    library: 'Metrics'
  }
}
