# UserDetails Role-Aware Submit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Select POST for GUEST and PATCH for USER after a fresh auth status lookup, preventing repeat UserDetails submissions from returning HTTP 409.

**Architecture:** Add a pure role-to-submit-method selector beside the UserDetails page so role handling can be tested independently. `UserDetails` validates input, refreshes current user status, selects the correct API function, and refreshes auth state a second time only after a GUEST POST succeeds.

**Tech Stack:** React 19, Axios, AuthContext, Node.js built-in test runner, ESLint, Vite

## Global Constraints

- Do not request auth status when required fields are missing.
- Call `refreshCurrentUser()` before choosing POST or PATCH.
- Use `postUserDetails` only for role `GUEST`.
- Use `patchUserDetails` only for role `USER`.
- Throw for a missing or unsupported role instead of guessing a request method.
- After a successful GUEST POST, call `refreshCurrentUser()` again before navigation.
- After a successful USER PATCH, do not call `refreshCurrentUser()` again.
- Preserve the existing HTTP 400 required-fields modal and non-400 console error behavior.

---

### Task 1: Role-aware submit selection and UserDetails flow

**Files:**
- Modify: `src/api/users/users.js`
- Create: `src/pages/UserDetails/userDetailsSubmit.js`
- Create: `src/pages/UserDetails/userDetailsSubmit.test.js`
- Modify: `src/pages/UserDetails/UserDetails.jsx`
- Modify: `src/pages/UserDetails/userDetailsValidation.test.js`

**Interfaces:**
- Confirms: `patchUserDetails(requestBody): Promise<object>` in `src/api/users/users.js`
- Produces: `getUserDetailsSubmitter(role, { postUserDetails, patchUserDetails }): function`
- Consumes: `refreshCurrentUser(): Promise<{ role?: string } | null>`

- [ ] **Step 1: Write failing role selector tests**

```js
import assert from 'node:assert/strict';
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
```

- [ ] **Step 2: Run the tests and verify the missing module failure**

Run: `node --test src/pages/UserDetails/userDetailsSubmit.test.js`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `userDetailsSubmit.js`.

- [ ] **Step 3: Implement the minimal role selector**

```js
export function getUserDetailsSubmitter(
  role,
  { postUserDetails, patchUserDetails },
) {
  if (role === 'GUEST') return postUserDetails;
  if (role === 'USER') return patchUserDetails;

  throw new Error(`Unsupported user role: ${role ?? 'missing'}`);
}
```

- [ ] **Step 4: Run the selector tests and verify they pass**

Run: `node --test src/pages/UserDetails/userDetailsSubmit.test.js`

Expected: 2 tests PASS and 0 tests FAIL.

- [ ] **Step 5: Add a failing UserDetails source contract test**

Append to `src/pages/UserDetails/userDetailsSubmit.test.js`:

```js
import { readFile } from 'node:fs/promises';

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
```

Update `src/pages/UserDetails/userDetailsValidation.test.js` to continue asserting that `hasMissingUserDetails(requestBody)` appears before the first `refreshCurrentUser()` call:

```js
const validationIndex = source.indexOf('hasMissingUserDetails(requestBody)');
const statusIndex = source.indexOf('await refreshCurrentUser()');
assert.ok(validationIndex >= 0 && validationIndex < statusIndex);
```

- [ ] **Step 6: Run UserDetails tests and verify the integration test fails**

Run: `node --test src/pages/UserDetails/userDetailsSubmit.test.js src/pages/UserDetails/userDetailsValidation.test.js`

Expected: selector tests PASS and integration tests FAIL because UserDetails still always calls POST.

- [ ] **Step 7: Integrate PATCH and status-based selection**

Ensure `src/api/users/users.js` exports:

```js
export async function patchUserDetails(requestBody) {
    const response = await apiClient.patch('/api/users/details', requestBody);
    return response.data;
}
```

In `src/pages/UserDetails/UserDetails.jsx`, replace the API import with:

```jsx
import {
    patchUserDetails,
    postUserDetails,
} from '../../api/users/users.js';
```

Import:

```jsx
import { getUserDetailsSubmitter } from './userDetailsSubmit.js';
```

Replace the unconditional POST and unconditional post-submit refresh with:

```jsx
const currentUser = await refreshCurrentUser();
const submitUserDetails = getUserDetailsSubmitter(currentUser?.role, {
    patchUserDetails,
    postUserDetails,
});
const responseBody = await submitUserDetails(requestBody);
console.log(responseBody.message);

if (currentUser?.role === 'GUEST') {
    await refreshCurrentUser();
}
```

Keep navigation immediately after this block and preserve the existing catch handling.

- [ ] **Step 8: Run focused regression tests**

Run: `node --test src/pages/UserDetails/userDetailsSubmit.test.js src/pages/UserDetails/userDetailsValidation.test.js src/components/RequiredFieldsModal.test.js src/pages/Surveys/surveyPageLayout.test.js`

Expected: 9 tests PASS and 0 tests FAIL.

- [ ] **Step 9: Run repository verification**

Run: `npm.cmd run lint`

Expected: command exits with code 0 and reports no ESLint errors.

Run: `npm.cmd run build`

Expected: Vite build exits with code 0 and writes the production bundle.

- [ ] **Step 10: Review and commit task files**

Run: `git diff --check`

Expected: no whitespace errors.

```bash
git add src/api/users/users.js src/pages/UserDetails/UserDetails.jsx src/pages/UserDetails/userDetailsSubmit.js src/pages/UserDetails/userDetailsSubmit.test.js src/pages/UserDetails/userDetailsValidation.test.js
git commit -m "fix: update existing user details with patch"
```
