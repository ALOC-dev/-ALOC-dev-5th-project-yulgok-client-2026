import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('InlineInput renders an optional label-side error with the required style', async () => {
  const source = await readFile(
    new URL('./InlineInput.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /errorMessage/);
  assert.match(source, /role="alert"/);
  assert.match(source, /text-fg-error text-xs font-bold/);
});
