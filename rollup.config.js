import commonjs from '@rollup/plugin-commonjs'
import inject from '@rollup/plugin-inject'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import path from 'path'
import copy from 'rollup-plugin-copy'
import del from 'rollup-plugin-delete'
import generatePackageJson from 'rollup-plugin-generate-package-json'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'

const DIST = path.resolve(__dirname, './dist')
const exportName = 'index'
const libraryName = 'Merics'

const dtsFilename = `${exportName}.d.ts`
const cjsFilename = `${exportName}.cjs`
const esmFilename = `${exportName}.mjs`

const pkg = Object.assign(require('./package.json'), {
  private: false,
  sideEffects: false,
  devDependencies: {},
  scripts: {},
  type: 'module',
  main: `./${cjsFilename}`,
  module: `./${esmFilename}`,
  types: `./${dtsFilename}`,
  exports: {
    import: `./${esmFilename}`,
    require: `./${cjsFilename}`
  }
})

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: path.resolve(DIST, cjsFilename),
        name: libraryName,
        format: 'cjs',
        sourcemap: true
      },
      {
        file: path.resolve(DIST, esmFilename),
        format: 'es',
        sourcemap: true
      }
    ],
    external: [
      'axios',
      'cockatiel',
      'pako',
      'buffer'
    ],
    plugins: [
      json(),
      typescript({ target: 'esnext' }),
      terser({
        ecma: 'esnext',
        compress: true,
        mangle: false
      }),
      commonjs(),
      nodeResolve(),
      inject({
        Buffer: 'buffer'
      }),
      del({ targets: DIST }),
      generatePackageJson({
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
