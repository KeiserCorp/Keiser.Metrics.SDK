const { join } = require('path')
const fs = require('fs')
const spawn = require('cross-spawn')
const semverValid = require('semver/functions/valid')
const semverPrerelease = require('semver/functions/prerelease')

const rootTargetPath = 'dist'
const args = process.argv.slice(2)

['core', 'admin', 'sso'].forEach(target => {
  const targetPath = join(rootTargetPath, target)
  const version = require(join(process.cwd(), targetPath, 'package.json')).version

  if (!semverValid(version)) {
    console.error(`Error: invalid version "${version}"`)
    process.exit(1)
  }
  
  const prerelease = semverPrerelease(version)
  const tag = (prerelease && prerelease.length) ? prerelease.filter(part => typeof part === 'string').join('.') || 'prerelease' : false
  const tagArgs = tag ? ['--tag', tag] : []
  const npm = /^win/.test(process.platform) ? 'npm.cmd' : 'npm'
  
  fs.writeFileSync(join(process.cwd(), targetPath, '.npmrc'), `//registry.npmjs.org/:_authToken=${process.env.NPM_TOKEN}`)
  
  spawn(npm, ['publish', ...args, ...tagArgs], {
    stdio: 'inherit',
    cwd: join(process.cwd(), targetPath)
  }).on('exit', code => {
    process.exitCode = code
  }).on('error', e => console.error(e))
})