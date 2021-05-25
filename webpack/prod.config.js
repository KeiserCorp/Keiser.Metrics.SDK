const webpack = require('webpack')
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const WriteJsonPlugin = require('write-json-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const DIST = path.resolve(__dirname, '../dist')

const importPath = './src/index.ts'
const exportName = 'index'

const packageData = Object.assign(require('../package.json'), {
  private: false,
  sideEffects: false,
  devDependencies: undefined,
  scripts: undefined,
  type: 'module',
  main: `./${exportName}.cjs`,
  module: `./esm/${exportName}.js`,
  browser: `./${exportName}.browser.js`,
  types: './types/index.d.ts',
  exports: {
    import: `./esm/${exportName}.js`,
    require: `./${exportName}.cjs`,
    node: `./esm/${exportName}.js`,
    default: `./${exportName}.umd.js`
  }
})

const cjsConfig = {
  mode: 'production',
  target: 'web',
  devtool: 'source-map',
  entry: {
    cjs: {
      import: importPath,
      filename: `${exportName}.cjs`,
      library: {
        type: 'commonjs-module'
      }
    }
  },
  externals: {
    axios: 'commonjs2 axios',
    buffer: 'commonjs2 buffer',
    cockatiel: 'commonjs2 cockatiel',
    pako: 'commonjs2 pako'
  },
  output: {
    path: DIST
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 'es2017',
          mangle: false,
          module: true
        }
      })
    ]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              declarationDir: null,
              declaration: false,
              sourceMap: true
            }
          }
        },
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'README.md', to: 'README.md' },
        { from: 'LICENSE.md', to: 'LICENSE.md' }
      ]
    }),
    new WriteJsonPlugin({
      object: packageData,
      filename: 'package.json',
      pretty: true
    })
  ]
}

const browserConfig = {
  mode: 'production',
  target: 'web',
  devtool: false,
  entry: {
    window: {
      import: importPath,
      filename: `${exportName}.browser.js`,
      library: {
        name: 'Metrics',
        type: 'window'
      }
    },
    umd: {
      import: importPath,
      filename: `${exportName}.umd.js`,
      library: {
        name: 'Metrics',
        type: 'umd'
      }
    }
  },
  output: {
    path: DIST
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      buffer: 'buffer'
    }
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          ecma: 'es5',
          mangle: true,
          module: true
        }
      })
    ]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              declarationDir: null,
              declaration: false,
              sourceMap: false
            }
          }
        },
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer']
    })
  ]
}

module.exports = [cjsConfig, browserConfig]
