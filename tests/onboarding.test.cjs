const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

test('closing setup cancels a pending automatic opening', () => {
  const timers = new Map();
  const values = new Map();
  const classes = new Set(['hidden']);
  const overlay = { classList: { add: value => classes.add(value), remove: value => classes.delete(value), contains: value => classes.has(value) }, innerHTML: '' };
  const context = vm.createContext({
    cloudUser: null, userProfile: { accountKey: 'test-account' },
    personalProgramForCurrentUser: () => null,
    document: {
      readyState: 'loading', addEventListener() {},
      body: { classList: { remove() {} } },
      getElementById: id => id === 'weeklyPlanWizard' ? overlay : { classList: { contains: () => false } }
    },
    localStorage: { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) },
    window: { setTimeout: callback => { timers.set(1, callback); return 1; }, clearTimeout: id => timers.delete(id) }
  });
  const source = fs.readFileSync(path.join(__dirname, '../weekly-plan-onboarding.js'), 'utf8');
  vm.runInContext(source.replace(/\}\)\(\);\s*$/, 'globalThis.testWizard = { maybeAutoOpen, closeWizard }; })();'), context);
  context.testWizard.maybeAutoOpen();
  assert.equal(timers.size, 1);
  context.testWizard.closeWizard();
  assert.equal(timers.size, 0);
  context.testWizard.maybeAutoOpen();
  assert.equal(timers.size, 0);
  assert.equal(classes.has('hidden'), true);
});
