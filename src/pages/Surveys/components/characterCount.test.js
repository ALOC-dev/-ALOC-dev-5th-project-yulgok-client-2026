import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('input components support opt-in current/max character counters', async () => {
  const inlineInputSource = await readFile(
    new URL('../../UserDetails/components/InlineInput.jsx', import.meta.url),
    'utf8',
  );
  const textAreaSource = await readFile(
    new URL('./TextArea.jsx', import.meta.url),
    'utf8',
  );

  for (const source of [inlineInputSource, textAreaSource]) {
    assert.match(source, /showCharacterCount/);
    assert.match(source, /String\(value \?\? ''\)\.length/);
    assert.match(source, /\{currentLength\}\/\{maxLength\}/);
  }
});

test('SurveyIntroduce enables 8 and 200 character counters', async () => {
  const source = await readFile(
    new URL('../SurveyIntroduce.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /name="nickname"[\s\S]*?maxLength=\{8\}[\s\S]*?showCharacterCount/);
  assert.match(source, /<TextArea[\s\S]*?maxLength=\{200\}[\s\S]*?showCharacterCount/);
  assert.doesNotMatch(source, /maxLength=\{500\}/);
});
