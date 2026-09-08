const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function app() {
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key) };
  const context = vm.createContext({
    document: { readyState: 'loading', addEventListener() {} },
    localStorage: storage, sessionStorage: storage, console, URL, Date,
    setTimeout, clearTimeout
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8'), context);
  return context;
}

test('grade boundaries and invalid numbers have consistent letters', () => {
  const context = app();
  for (const [score, letter] of [[100, 'A'], [90, 'A'], [89, 'B'], [80, 'B'], [79, 'C'], [70, 'C'], [60, 'D'], [59, 'F'], [NaN, 'F']]) {
    assert.equal(context.workoutLetterForPercentage(score), letter);
  }
});

test('warmups, invalid input and duplicate set slots cannot inflate completion', () => {
  const context = app();
  const plan = { name: 'Audit', exercises: [{ name: 'Squat', sets: 3, repRange: [8, 12] }] };
  const working = { exerciseIndex: 0, set: 1, weight: 50, reps: 10, setType: 'Working' };
  const logs = [working, { ...working }, { ...working, set: 2, setType: 'Warmup' }, { ...working, set: 3, reps: -1 }, { ...working, set: 4 }];
  assert.equal(context.completedWorkingSetCount(plan, logs), 1);
  assert.equal(context.completedWorkingSetCount(plan, []), 0);
});

test('new completed workouts grade consistently and incomplete workouts score lower', () => {
  const context = app();
  const plan = { name: 'Audit', exercises: [{ name: 'Squat', sets: 3, repRange: [8, 12] }] };
  const logs = [1, 2, 3].map(set => ({ exerciseIndex: 0, exercise: 'Squat', set, weight: 50, reps: 10, setType: 'Working' }));
  const full = context.calculateWorkoutGrade(plan, logs, []);
  assert.equal(full.letter, 'A');
  assert.equal(full.components.setCompletion.completed, 3);
  assert.equal(full.percentage, context.calculateWorkoutGrade(plan, logs, []).percentage);
  assert.ok(context.calculateWorkoutGrade(plan, logs.slice(0, 1), []).percentage < full.percentage);
  assert.equal(context.calculateWorkoutGrade(plan, [], []).percentage, 0);
});
