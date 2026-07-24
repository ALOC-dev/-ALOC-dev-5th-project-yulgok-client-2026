import assert from 'node:assert/strict';
import test from 'node:test';
import { getDropdownScrollOffset } from './getDropdownScrollOffset.js';

test('returns only the distance needed to reveal the dropdown with margin', () => {
  assert.equal(getDropdownScrollOffset(780, 720), 76);
});

test('returns zero when the dropdown already fits in the viewport', () => {
  assert.equal(getDropdownScrollOffset(680, 720), 0);
  assert.equal(getDropdownScrollOffset(704, 720), 0);
});
