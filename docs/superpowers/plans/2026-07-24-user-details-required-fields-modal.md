# UserDetails Required Fields Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent incomplete UserDetails submissions and show the shared modal with `모든 항목은 필수 입력입니다.` for missing values or an HTTP 400 response.

**Architecture:** Put the deterministic missing-field and HTTP-status checks in a small page-local validation module so Node's built-in test runner can exercise them without a browser test dependency. `UserDetails.jsx` owns the modal state, skips the API call when validation fails, and reuses the same modal for a server-side 400 response.

**Tech Stack:** React 19, Axios, shared React `Modal`, Node.js built-in test runner, ESLint, Vite

## Global Constraints

- Validate `realName`, `age`, `gender`, `phoneNumber`, `studentId`, and `department` before calling the API.
- Treat whitespace-only strings as missing and require age to be a finite number greater than zero.
- Display the exact body copy `모든 항목은 필수 입력입니다.`.
- Use the title `입력 확인`.
- Do not render a footer confirmation button.
- Allow dismissal through the top-right close button, overlay click, and Escape key.
- Preserve the existing success flow: refresh the current user and navigate to `/surveys/sleep`.
- Preserve console logging for non-400 request failures.

---

### Task 1: Required-field checks and UserDetails modal flow

**Files:**
- Create: `src/pages/UserDetails/userDetailsValidation.js`
- Create: `src/pages/UserDetails/userDetailsValidation.test.js`
- Modify: `src/pages/UserDetails/UserDetails.jsx`

**Interfaces:**
- Produces: `hasMissingUserDetails(details: object): boolean`
- Produces: `isBadRequest(error: unknown): boolean`
- Consumes: Axios-style errors with an optional `response.status` number and the shared `Modal` component.

- [ ] **Step 1: Write the failing validation tests**

```js
import assert from 'node:assert/strict';
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
```

- [ ] **Step 2: Run the test to verify it fails for the missing module**

Run: `node --test src/pages/UserDetails/userDetailsValidation.test.js`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `userDetailsValidation.js`.

- [ ] **Step 3: Implement the minimal validation module**

```js
const requiredStringFields = [
  'realName',
  'gender',
  'phoneNumber',
  'studentId',
  'department',
];

export function hasMissingUserDetails(details) {
  const hasMissingString = requiredStringFields.some(
    (field) => String(details[field] ?? '').trim() === '',
  );
  const age = Number(details.age);

  return hasMissingString || !Number.isFinite(age) || age <= 0;
}

export function isBadRequest(error) {
  return error?.response?.status === 400;
}
```

- [ ] **Step 4: Run the validation tests and verify they pass**

Run: `node --test src/pages/UserDetails/userDetailsValidation.test.js`

Expected: 2 tests PASS and 0 tests FAIL.

- [ ] **Step 5: Add a failing source contract test for the modal integration**

Append to `src/pages/UserDetails/userDetailsValidation.test.js`:

```js
import { readFile } from 'node:fs/promises';

test('UserDetails renders the required-fields modal without a footer action', async () => {
  const source = await readFile(
    new URL('./UserDetails.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /hasMissingUserDetails\(requestBody\)/);
  assert.match(source, /isBadRequest\(error\)/);
  assert.match(source, /<Modal/);
  assert.match(source, /title="입력 확인"/);
  assert.match(source, /모든 항목은 필수 입력입니다\./);
  assert.doesNotMatch(source, /<Modal\.Footer>/);
});
```

- [ ] **Step 6: Run the source contract test and verify it fails**

Run: `node --test src/pages/UserDetails/userDetailsValidation.test.js`

Expected: the first 2 tests PASS and `UserDetails renders the required-fields modal without a footer action` FAIL because `UserDetails.jsx` does not yet use `Modal`.

- [ ] **Step 7: Integrate preflight validation, HTTP 400 handling, and the shared modal**

In `src/pages/UserDetails/UserDetails.jsx`:

```jsx
import { Modal } from '../../components/Modal/index.js';
import {
    hasMissingUserDetails,
    isBadRequest,
} from './userDetailsValidation.js';
```

Add state alongside the existing field state:

```jsx
const [showRequiredFieldsModal, setShowRequiredFieldsModal] = useState(false);
```

Update `handleNext` after constructing `requestBody` and before entering the API `try` block:

```jsx
if (hasMissingUserDetails(requestBody)) {
    setShowRequiredFieldsModal(true);
    return;
}
```

Replace the catch block with:

```jsx
} catch (error) {
    if (isBadRequest(error)) {
        setShowRequiredFieldsModal(true);
        return;
    }

    console.error(error);
}
```

Render the controlled modal as the final child of `<main>`:

```jsx
<Modal
    open={showRequiredFieldsModal}
    onClose={() => setShowRequiredFieldsModal(false)}
    title="입력 확인"
    size="small"
>
    <p className="m-0 text-sm text-fg-basic">
        모든 항목은 필수 입력입니다.
    </p>
</Modal>
```

Do not pass `closeOnOverlayClick` or `closeOnEscape`; their shared-component defaults are `true`. Do not add `Modal.Footer`.

- [ ] **Step 8: Run focused and existing Node tests**

Run: `node --test src/pages/UserDetails/userDetailsValidation.test.js src/pages/Surveys/surveyPageLayout.test.js`

Expected: 4 tests PASS and 0 tests FAIL.

- [ ] **Step 9: Run repository verification**

Run: `npm run lint`

Expected: command exits with code 0 and reports no ESLint errors.

Run: `npm run build`

Expected: Vite build exits with code 0 and writes the production bundle.

- [ ] **Step 10: Review the diff and commit the implementation**

Run: `git diff --check`

Expected: no whitespace errors.

```bash
git add src/pages/UserDetails/UserDetails.jsx src/pages/UserDetails/userDetailsValidation.js src/pages/UserDetails/userDetailsValidation.test.js
git commit -m "fix: show modal for incomplete user details"
```
