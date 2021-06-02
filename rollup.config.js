import commonjs from '@rollup/plugin-commonjs'
import inject from '@rollup/plugin-inject'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import path from 'path'
import copy from 'rollup-plugin-copy'
import del from 'rollup-plugin-delete'
import generatePackageJson from 'rollup-plugin-generate-package-json'
import typescript from 'rollup-plugin-typescript2'

const DIST = path.resolve(__dirname, './dist')
const SRC = path.resolve(__dirname, 'src/index.ts')

const pkg = Object.assign(require('./package.json'), {
  private: false,
  sideEffects: false,
  devDependencies: {},
  scripts: {},
  type: 'module',
  main: './index.cjs',
  module: './index.mjs',
  types: './index.d.ts',
  exports: {
    '.': {
      import: './index.mjs',
      require: './index.cjs'
    },
    './*': {
      import: './*.mjs',
      require: './*.cjs'
    },
    './models/*': {
      import: './models/*.mjs',
      require: './models/*.cjs'
    },
    './lib/*': {
      import: './lib/*.mjs',
      require: './lib/*.cjs'
    }
  }
})

export default [
  {
    input: SRC,
    preserveModules: true,
    output: [
      {
        dir: DIST,
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
        entryFileNames: '[name].cjs'
      },
      {
        dir: DIST,
        format: 'es',
        sourcemap: true,
        exports: 'named',
        entryFileNames: '[name].mjs'
      }
    ],
    external: [
      'axios',
      'cockatiel',
      'pako',
      'buffer'
    ],
    plugins: [
      del({ targets: path.resolve(DIST, '*') }),
      json(),
      typescript({
        tsconfigOverride: {
          include: [SRC],
          compilerOptions: {
            target: 'esnext',
            declaration: true
          }
        }
      }),
      commonjs(),
      nodeResolve(),
      inject({
        Buffer: ['buffer', 'Buffer'],
        include: ['src/lib/*']
      }),
      generatePackageJson({
        outputFolder: DIST,
        baseContents: pkg
      }),
      copy({
        targets: [
          { src: 'README.md', dest: DIST },
          { src: 'LICENSE.md', dest: DIST }
        ]
      })
    ]
  }
]
