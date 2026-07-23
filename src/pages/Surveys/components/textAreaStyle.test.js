import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('textarea uses the same subtle shadow as inline inputs', async () => {
    const source = await readFile(new URL('./TextArea.jsx', import.meta.url), 'utf8');

    assert.match(source, /shadow-sm/);
});
