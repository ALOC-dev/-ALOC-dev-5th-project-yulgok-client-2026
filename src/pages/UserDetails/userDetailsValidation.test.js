import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  hasMissingUserDetails,
  isBadRequest,
} from './userDetailsValidation.js';

const completeDetails = {
  realName: '홍길동',
  age: 20,
  gender: 'MALE',
  phoneNumber: '010-1234-5678',
  studentId: '2026920000',
  department: '컴퓨터공학부',
};

test('reports missing required user details without accepting whitespace', () => {
  assert.equal(hasMissingUserDetails(completeDetails), false);
  assert.equal(hasMissingUserDetails({ ...completeDetails, realName: '   ' }), true);
  assert.equal(hasMissingUserDetails({ ...completeDetails, age: 0 }), true);
  assert.equal(hasMissingUserDetails({ ...completeDetails, department: '' }), true);
});

test('recognizes only HTTP 400 as a bad request', () => {
  assert.equal(isBadRequest({ response: { status: 400 } }), true);
  assert.equal(isBadRequest({ response: { status: 500 } }), false);
  assert.equal(isBadRequest(new Error('network failure')), false);
});

test('UserDetails renders the required-fields modal without a footer action', async () => {
  const source = await readFile(
    new URL('./UserDetails.jsx', import.meta.url),
    'utf8',
  );
  const validationIndex = source.indexOf('hasMissingUserDetails(requestBody)');
  const statusIndex = source.indexOf('await refreshCurrentUser()');

  assert.match(source, /hasMissingUserDetails\(requestBody\)/);
  assert.match(source, /isBadRequest\(error\)/);
  assert.match(source, /<RequiredFieldsModal/);
  assert.ok(validationIndex >= 0 && validationIndex < statusIndex);
});

test('UserDetails starts age empty so the placeholder is visible', async () => {
  const source = await readFile(
    new URL('./UserDetails.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /const \[age, setAge\] = useState\(''\)/);
});
