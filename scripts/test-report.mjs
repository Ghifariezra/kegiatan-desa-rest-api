import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';

rmSync('allure-results', { recursive: true, force: true });
rmSync('allure-report', { recursive: true, force: true });

const run = (cmd, env = {}) =>
    spawnSync(cmd, { stdio: 'inherit', shell: true, env: { ...process.env, ...env } });

const test = run(
    'npx mocha --no-parallel --reporter allure-mocha --reporter-option resultsDir=./allure-results',
    { ALLURE_REPORT: '1' }
);
const report = run('npx allure generate ./allure-results --output ./allure-report');

// Report tetap dibuat walau ada test gagal, tapi exit code tetap mencerminkan hasil test (penting untuk CI).
process.exit(test.status || report.status || 0);