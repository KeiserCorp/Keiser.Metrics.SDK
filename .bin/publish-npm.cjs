const { join } = require("path");
const spawn = require("cross-spawn");
const semverValid = require("semver/functions/valid");
const semverPrerelease = require("semver/functions/prerelease");

const rootTargetPath = "dist";
const args = process.argv.slice(2);
const packages = ["core", "admin", "sso"];

function publishPackage(target) {
  return new Promise((resolve, reject) => {
    const targetPath = join(rootTargetPath, target);
    const version = require(join(
      process.cwd(),
      targetPath,
      "package.json"
    )).version;

    if (!semverValid(version)) {
      console.error(`Error: invalid version "${version}"`);
      reject(new Error(`Invalid version: ${version}`));
      return;
    }

    const prerelease = semverPrerelease(version);
    const tag =
      prerelease && prerelease.length
        ? prerelease.filter((part) => typeof part === "string").join(".") ||
          "prerelease"
        : false;
    const tagArgs = tag ? ["--tag", tag] : [];
    const npm = /^win/.test(process.platform) ? "npm.cmd" : "npm";

    console.log(`Publishing ${target}...`);
    spawn(npm, ["publish", "--provenance", ...args, ...tagArgs], {
      stdio: "inherit",
      cwd: join(process.cwd(), targetPath),
    })
      .on("exit", (code) => {
        if (code === 0) {
          console.log(`Successfully published ${target}`);
          resolve();
        } else {
          reject(new Error(`Failed to publish ${target} with exit code ${code}`));
        }
      })
      .on("error", (e) => reject(e));
  });
}

async function publishAll() {
  for (const target of packages) {
    await publishPackage(target);
  }
}

publishAll().catch((error) => {
  console.error(error);
  process.exit(1);
});
