const webpack = require('webpack')
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const WriteJsonPlugin = require('write-json-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const DIST = path.resolve(__dirname, '../dist')

const importPath = './src/index.ts'
const exportName = 'metrics'

const packageData = Object.assign(require('../package.json'), {
  main: `./${exportName}.cjs`,
  module: `./${exportName}.mjs`,
  browser: `./${exportName}.browser.js`,
  types: './types/index.d.ts',
  private: false,
  devDependencies: {},
  scripts: {},
  exports: {
    import: `./${exportName}.mjs`,
    require: `./${exportName}.cjs`,
    node: `./${exportName}.node.js`
  }
})

const esmConfig = {
  mode: 'production',
  target: 'web',
  devtool: 'source-map',
  entry: {
    esm: {
      import: importPath,
      filename: `${exportName}.mjs`,
      library: {
        type: 'module'
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
        terserOptions: {
          ecma: 'esnext',
          mangle: true,
          module: true
        }
      })
    ]
  },
  experiments: {
    outputModule: true
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              declaration: true,
              sourceMap: true
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
    }),
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

const cjsConfig = {
  mode: 'production',
  target: 'web',
  devtool: 'source-map',
  entry: {
    cjs: {
      import: importPath,
      filename: `${exportName}.cjs`,
      library: {
        name: 'Metrics',
        type: 'commonjs2'
      }
    }
  },
  externals: {
    axios: 'axios',
    buffer: 'buffer',
    cockatiel: 'cockatiel',
    pako: 'pako'
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
        terserOptions: {
          ecma: 'es2017',
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
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer']
    })
  ]
}

const browserConfig = {
  mode: 'production',
  target: 'web',
  devtool: 'source-map',
  entry: {
    window: {
      import: importPath,
      filename: `${exportName}.browser.js`,
      library: {
        name: 'Metrics',
        type: 'window'
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
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer']
    })
  ]
}

const nodeConfig = {
  mode: 'production',
  target: 'node',
  devtool: 'source-map',
  entry: {
    window: {
      import: importPath,
      filename: `${exportName}.node.js`,
      library: {
        name: 'Metrics',
        type: 'commonjs2'
      }
    }
  },
  externals: {
    axios: 'axios',
    buffer: 'buffer',
    cockatiel: 'cockatiel',
    pako: 'pako'
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
              declaration: false,
              sourceMap: true
            }
          }
        },
        exclude: /node_modules/
      }
    ]
  }
}

module.exports = [esmConfig, cjsConfig, browserConfig, nodeConfig]
