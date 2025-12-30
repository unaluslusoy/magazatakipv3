#!/usr/bin/env node

const fs = require('fs');
const { spawnSync } = require('child_process');

const configFiles = [
  '.eslintrc',
  '.eslintrc.js',
  '.eslintrc.cjs',
  '.eslintrc.json',
  'eslint.config.js',
  'eslint.config.mjs',
  'eslint.config.cjs',
];

const hasConfig = configFiles.some(f => fs.existsSync(f));

if (!hasConfig) {
  console.log('ESLint config yok, lint atlandı.');
  process.exit(0);
}

const result = spawnSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['eslint', '.'],
  { stdio: 'inherit' }
);

process.exit(result.status ?? 1);

