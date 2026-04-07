#!/usr/bin/env node
// Verifies package-lock.json is in sync with package.json.
// Mirrors what `npm ci` checks — catches lockfile drift before it hits CI.
const fs = require("node:fs");

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const lock = JSON.parse(fs.readFileSync("package-lock.json", "utf8"));

const declared = {
  ...pkg.dependencies,
  ...pkg.devDependencies,
};

const missing = Object.keys(declared).filter((name) => !lock.packages?.[`node_modules/${name}`]);

if (missing.length > 0) {
  console.error("package-lock.json is out of sync with package.json.");
  console.error("Missing from lockfile:", missing.join(", "));
  console.error("Fix: run `npm install` and commit the updated lockfile.");
  process.exit(1);
}
