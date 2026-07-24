import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('UserDetails prioritizes missing values before format errors and requests', async () => {
  const source = await readFile(
    new URL('./UserDetails.jsx', import.meta.url),
    'utf8',
  );
  const missingIndex = source.indexOf('hasMissingUserDetails(formValues)');
  const formatIndex = source.indexOf('getUserDetailsFieldErrors(formValues)');
  const statusIndex = source.indexOf('await refreshCurrentUser()');

  assert.match(source, /setIsFormatValidationActive\(true\)/);
  assert.match(source, /errorMessage=\{fieldErrors\.age\}/);
  assert.match(source, /errorMessage=\{fieldErrors\.phoneNumber\}/);
  assert.match(source, /errorMessage=\{fieldErrors\.studentId\}/);
  assert.ok(missingIndex >= 0 && missingIndex < formatIndex);
  assert.ok(formatIndex >= 0 && formatIndex < statusIndex);
});
