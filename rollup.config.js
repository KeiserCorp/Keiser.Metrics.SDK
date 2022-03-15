import commonjs from '@rollup/plugin-commonjs'
import inject from '@rollup/plugin-inject'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import path from 'path'
import copy from 'rollup-plugin-copy'
import del from 'rollup-plugin-delete'
import execute from 'rollup-plugin-execute'
import generatePackageJson from 'rollup-plugin-generate-package-json'
import typescript from 'rollup-plugin-typescript2'

import packageInfo from './package.json'

const buildConfig = (entryPoint) => {
  const DIST = path.resolve(__dirname, './dist', entryPoint)
  const ESNEXT_DIST = path.resolve(DIST, 'esnext')
  const SRC = path.resolve(__dirname, 'src', entryPoint + '.ts')
  const MODELS = path.resolve(__dirname, 'src', 'models', '*')
  const TYPES = path.resolve(__dirname, 'types', '*.d.ts')

  const pkg = Object.assign({}, packageInfo, {
    name: packageInfo.name + (entryPoint !== 'core' ? `-${entryPoint}` : ''),
    description: packageInfo.description + (entryPoint === 'admin' ? ' with Admin module' : (entryPoint === 'sso' ? ' with SSO module' : '')),
    private: false,
    sideEffects: false,
    devDependencies: {},
    scripts: {},
    type: 'module',
    main: `./${entryPoint}.cjs`,
    module: `./${entryPoint}.mjs`,
    types: `./${entryPoint}.d.ts`,
    exports: {
      '.': {
        import: `./${entryPoint}.mjs`,
        require: `./${entryPoint}.cjs`
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
      },
      './esnext': {
        import: `./esnext/${entryPoint}.mjs`,
        require: `./esnext/${entryPoint}.cjs`
      },
      './esnext/*': {
        import: './esnext/*.mjs',
        require: './esnext/*.cjs'
      },
      './esnext/models/*': {
        import: './esnext/models/*.mjs',
        require: './esnext/models/*.cjs'
      },
      './esnext/lib/*': {
        import: './esnext/lib/*.mjs',
        require: './esnext/lib/*.cjs'
      }
    }
  })

  return [
    {
      input: SRC,
      preserveModules: true,
      treeshake: false,
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
        del({ targets: path.resolve(DIST, '*'), hook: 'buildStart' }),
        json(),
        typescript({
          tsconfigOverride: {
            include: [SRC, TYPES, MODELS],
            compilerOptions: {
              target: 'es2017',
              module: 'esnext',
              declaration: true
            }
          }
        }),
        commonjs(),
        nodeResolve(),
        inject({
          Buffer: ['buffer', 'Buffer'],
          include: ['src/**/*']
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
        }),
        execute([
        `npx auto-changelog -o ${path.resolve(DIST, 'CHANGELOG.md')} -t keepachangelog --commit-limit false`
        ])
      ]
    },
    {
      input: SRC,
      preserveModules: true,
      treeshake: false,
      output: [
        {
          dir: ESNEXT_DIST,
          format: 'cjs',
          sourcemap: true,
          exports: 'named',
          entryFileNames: '[name].cjs'
        },
        {
          dir: ESNEXT_DIST,
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
        json(),
        typescript({
          tsconfigOverride: {
            include: [SRC, TYPES, MODELS],
            compilerOptions: {
              target: 'esnext',
              module: 'esnext',
              declaration: true
            }
          }
        }),
        commonjs(),
        nodeResolve(),
        inject({
          Buffer: ['buffer', 'Buffer'],
          include: ['src/**/*']
        })
      ]
    }
  ]
}

export default [...buildConfig('core'), ...buildConfig('admin'), ...buildConfig('sso')]
