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

const requiredModalPagePaths = [
  new URL('../pages/Surveys/SurveySleep.jsx', import.meta.url),
  new URL('../pages/Surveys/SurveyClean.jsx', import.meta.url),
  new URL('../pages/Surveys/SurveyLiving.jsx', import.meta.url),
];

test('survey pages use RequiredFieldsModal without inline error state', async () => {
  for (const pagePath of requiredModalPagePaths) {
    const source = await readFile(pagePath, 'utf8');

    assert.match(source, /<RequiredFieldsModal/);
    assert.match(source, /setShowRequiredFieldsModal\(true\)/);
    assert.doesNotMatch(source, /errorMessage/);
    assert.doesNotMatch(source, /<Modal[\s>]/);
  }
});

test('UserDetails uses RequiredFieldsModal alongside field format errors', async () => {
  const source = await readFile(
    new URL('../pages/UserDetails/UserDetails.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /<RequiredFieldsModal/);
  assert.match(source, /setShowRequiredFieldsModal\(true\)/);
  assert.match(source, /errorMessage=\{fieldErrors\.(age|phoneNumber|studentId)\}/);
  assert.doesNotMatch(source, /<Modal[\s>]/);
});
