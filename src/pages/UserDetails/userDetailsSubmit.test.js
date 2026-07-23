import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { getUserDetailsSubmitter } from './userDetailsSubmit.js';

const postUserDetails = () => 'post';
const patchUserDetails = () => 'patch';
const submitters = { patchUserDetails, postUserDetails };

test('selects POST for GUEST and PATCH for USER', () => {
  assert.equal(getUserDetailsSubmitter('GUEST', submitters), postUserDetails);
  assert.equal(getUserDetailsSubmitter('USER', submitters), patchUserDetails);
});

test('rejects missing and unsupported user roles', () => {
  assert.throws(() => getUserDetailsSubmitter(undefined, submitters), /unsupported user role/i);
  assert.throws(() => getUserDetailsSubmitter('ADMIN', submitters), /unsupported user role/i);
});

test('UserDetails refreshes status before submit and refreshes again only for GUEST', async () => {
  const source = await readFile(
    new URL('./UserDetails.jsx', import.meta.url),
    'utf8',
  );
  const statusIndex = source.indexOf('const currentUser = await refreshCurrentUser()');
  const submitIndex = source.indexOf('await submitUserDetails(requestBody)');

  assert.match(source, /patchUserDetails/);
  assert.match(source, /getUserDetailsSubmitter\(currentUser\?\.role/);
  assert.match(source, /if \(currentUser\?\.role === 'GUEST'\)[\s\S]*?await refreshCurrentUser\(\)/);
  assert.ok(statusIndex >= 0 && statusIndex < submitIndex);
});
