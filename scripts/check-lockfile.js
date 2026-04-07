#!/usr/bin/env node
// Verifies package-lock.json is in sync with all workspace package.json files.
// Mirrors what `npm ci` checks — catches lockfile drift before it hits CI.
const fs = require("node:fs");

const lock = JSON.parse(fs.readFileSync("package-lock.json", "utf8"));

const manifests = ["package.json", "apps/app/package.json", "packages/auth/package.json"];

let missing = [];

for (const manifest of manifests) {
  if (!fs.existsSync(manifest)) continue;
  const pkg = JSON.parse(fs.readFileSync(manifest, "utf8"));
  const declared = { ...pkg.dependencies, ...pkg.devDependencies };
  const missingHere = Object.keys(declared).filter(
    (name) =>
      // workspace: refs are resolved locally, not in the lockfile
      !declared[name].startsWith("*") &&
      !declared[name].startsWith("workspace:") &&
      !lock.packages?.[`node_modules/${name}`]
  );
  if (missingHere.length > 0) {
    missing = missing.concat(missingHere.map((n) => `${manifest}: ${n}`));
  }
}

if (missing.length > 0) {
  console.error("package-lock.json is out of sync with package.json.");
  console.error(`Missing from lockfile:\n  ${missing.join("\n  ")}`);
  console.error("Fix: run `npm install` and commit the updated lockfile.");
  process.exit(1);
}
