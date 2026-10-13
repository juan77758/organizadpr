const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const cwd = path.resolve(__dirname, '..');

test('production refuses temporary storage and incomplete credentials', () => {
  const withoutDatabase = spawnSync(process.execPath, ['-e', "require('./src/config/database')"], {
    cwd, encoding: 'utf8', env: { ...process.env, NODE_ENV: 'production', DATABASE_URL: '' }
  });
  assert.notEqual(withoutDatabase.status, 0);
  assert.match(withoutDatabase.stderr, /DATABASE_URL es obligatorio/);
  const missingSecret = spawnSync(process.execPath, ['-e', "require('./src/config/runtime').validateRuntime()"], {
    cwd, encoding: 'utf8', env: { ...process.env, NODE_ENV: 'production', JWT_SECRET: '' }
  });
  assert.notEqual(missingSecret.status, 0);
  assert.match(missingSecret.stderr, /Configura JWT_SECRET/);
});
