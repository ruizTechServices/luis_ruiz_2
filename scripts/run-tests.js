/* Cross-platform test runner for all TS files in ./tests
 * Runs each test sequentially using tsx (local if available, else via npx).
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = process.cwd();
const testsDir = path.join(root, 'tests');

if (!fs.existsSync(testsDir)) {
  console.error('❌ tests/ directory not found:', testsDir);
  process.exit(1);
}

const files = fs
  .readdirSync(testsDir)
  .filter((f) => f.endsWith('.ts'))
  .sort();

if (!files.length) {
  console.log('ℹ️ No .ts files found in tests/. Nothing to run.');
  process.exit(0);
}

// Prefer local tsx binary if installed; otherwise fallback to `npx tsx`
const tsxLocal = path.join(
  root,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'tsx.cmd' : 'tsx'
);
const useLocalTsx = fs.existsSync(tsxLocal);

let failures = 0;
for (const file of files) {
  const filePath = path.join(testsDir, file);
  console.log(`\n=== Running ${file} ===`);

  const res = useLocalTsx
    ? spawnSync(tsxLocal, [filePath], { stdio: 'inherit', shell: false })
    : spawnSync('npx', ['tsx', filePath], { stdio: 'inherit', shell: true });

  if (res.status !== 0) {
    failures += 1;
    console.error(`⛔ ${file} failed with exit code ${res.status}`);
  } else {
    console.log(`✅ ${file} passed`);
  }
}

if (failures > 0) {
  console.error(`\n❌ ${failures} test file(s) failed.`);
  process.exit(1);
}

console.log('\n✅ All tests completed successfully');
