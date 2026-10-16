import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('affiliation 5 is Nanyang Technological University', () => {
  assert.match(
    html,
    /<span><sup>5<\/sup>Nanyang Technological University<\/span>/,
  );
  assert.doesNotMatch(html, /<span><sup>5<\/sup>National University of Singapore<\/span>/);
});
