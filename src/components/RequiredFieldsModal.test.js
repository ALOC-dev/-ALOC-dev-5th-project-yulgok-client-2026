import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('RequiredFieldsModal uses the shared close-only modal content', async () => {
  const source = await readFile(
    new URL('./RequiredFieldsModal.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /<Modal/);
  assert.match(source, /title="입력 확인"/);
  assert.match(source, /모든 항목은 필수 입력입니다\./);
  assert.doesNotMatch(source, /<Modal\.Footer>/);
  assert.doesNotMatch(source, /closeOnOverlayClick=/);
  assert.doesNotMatch(source, /closeOnEscape=/);
});
