import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  formatPhoneNumber,
  getUserDetailsFieldErrors,
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

test('formats phone numbers with hyphens while typing or pasting', () => {
  assert.equal(formatPhoneNumber('010'), '010');
  assert.equal(formatPhoneNumber('0101'), '010-1');
  assert.equal(formatPhoneNumber('0101234'), '010-1234');
  assert.equal(formatPhoneNumber('01012345678'), '010-1234-5678');
  assert.equal(formatPhoneNumber('010-1234-5678'), '010-1234-5678');
  assert.equal(formatPhoneNumber('010 1234 56789'), '010-1234-5678');
});

test('reports missing required user details without accepting whitespace', () => {
  assert.equal(hasMissingUserDetails(completeDetails), false);
  assert.equal(hasMissingUserDetails({ ...completeDetails, realName: '   ' }), true);
  assert.equal(hasMissingUserDetails({ ...completeDetails, age: 0 }), false);
  assert.equal(hasMissingUserDetails({ ...completeDetails, department: '' }), true);
});

test('recognizes only HTTP 400 as a bad request', () => {
  assert.equal(isBadRequest({ response: { status: 400 } }), true);
  assert.equal(isBadRequest({ response: { status: 500 } }), false);
  assert.equal(isBadRequest(new Error('network failure')), false);
});

test('distinguishes missing fields from invalid present fields', () => {
  assert.equal(hasMissingUserDetails({ ...completeDetails, age: '' }), true);
  assert.equal(hasMissingUserDetails({ ...completeDetails, age: '0' }), false);
});

test('returns field errors for invalid age, phone, and student ID', () => {
  assert.deepEqual(getUserDetailsFieldErrors(completeDetails), {});
  assert.deepEqual(
    getUserDetailsFieldErrors({
      ...completeDetails,
      age: '0',
      phoneNumber: '01012345678',
      studentId: '123',
    }),
    {
      age: '나이가 올바르지 않습니다.',
      phoneNumber: '전화번호 형식이 올바르지 않습니다.',
      studentId: '학번 형식이 올바르지 않습니다.',
    },
  );
  assert.equal(
    getUserDetailsFieldErrors({ ...completeDetails, age: '20.5' }).age,
    '나이가 올바르지 않습니다.',
  );
});

test('UserDetails renders the required-fields modal without a footer action', async () => {
  const source = await readFile(
    new URL('./UserDetails.jsx', import.meta.url),
    'utf8',
  );
  const validationIndex = source.indexOf('hasMissingUserDetails(formValues)');
  const statusIndex = source.indexOf('await refreshCurrentUser()');

  assert.match(source, /hasMissingUserDetails\(formValues\)/);
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
