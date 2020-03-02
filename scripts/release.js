const { join } = require('path')
const spawn = require('cross-spawn')
const semverValid = require('semver/functions/valid')
const semverPrerelease = require('semver/functions/prerelease')
const version = require('../package.json').version

if (!semverValid(version)) {
  console.error(`Error: invalid version "${version}"`)
  process.exit(1)
}

const prerelease = semverPrerelease(version)
const tag = prerelease.length ? prerelease.filter(part => typeof part === 'string').join('.') || 'prerelease' : false

const args = process.argv.slice(2)
const tagArgs = tag ? ['--tag', tag] : []
const npm = /^win/.test(process.platform) ? 'npm.cmd' : 'npm'

spawn(npm, ['publish', ...args, ...tagArgs], {
  stdio: 'inherit',
  cwd: join(process.cwd(), 'dist')
}).on('exit', code => {
  process.exitCode = code
}).on('error', e => console.error(e))
