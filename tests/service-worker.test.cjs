const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('activation removes old app caches without deleting other applications on the origin', async () => {
  const source = fs.readFileSync(require('node:path').join(__dirname, '../sw.js'), 'utf8');
  const current = source.match(/const CACHE = '([^']+)'/)[1];
  const handlers = {};
  const deleted = [];
  let claimed = false;
  vm.runInNewContext(source, {
    self: {
      addEventListener: (name, handler) => { handlers[name] = handler; },
      clients: { claim: async () => { claimed = true; } }
    },
    caches: {
      keys: async () => [current, 'level-up-fitness-old', 'another-app-v1'],
      delete: async key => { deleted.push(key); return true; }
    }
  });
  let finished;
  handlers.activate({ waitUntil: promise => { finished = promise; } });
  await finished;
  assert.deepEqual(deleted, ['level-up-fitness-old']);
  assert.equal(claimed, true);
});
