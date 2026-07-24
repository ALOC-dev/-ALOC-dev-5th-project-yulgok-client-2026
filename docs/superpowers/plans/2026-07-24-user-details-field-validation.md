# UserDetails Field Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show field-specific format errors beside UserDetails labels only after every required value exists.

**Architecture:** Extend the existing UserDetails validation module with pure missing-value and format-error functions. UserDetails keeps a validation-activated flag and error object, while InlineInput gains an optional label-side error slot with the exact requested styling.

**Tech Stack:** React 19, Node.js built-in test runner, Tailwind CSS, ESLint, Vite

## Global Constraints

- Missing values show only the existing required-fields modal.
- Format validation runs only when all required raw values exist.
- Invalid formats prevent status, POST, and PATCH requests.
- Age error: `나이가 올바르지 않습니다.`
- Phone error: `전화번호 형식이 올바르지 않습니다.`
- Student ID error: `학번 형식이 올바르지 않습니다.`
- Error style: `text-fg-error text-xs font-bold`.
- After the first format-validation attempt, edits to age, phone, and student ID update errors immediately.

---

### Task 1: Pure missing and format validation

**Files:**
- Modify: `src/pages/UserDetails/userDetailsValidation.js`
- Modify: `src/pages/UserDetails/userDetailsValidation.test.js`

**Interfaces:**
- Updates: `hasMissingUserDetails(details): boolean` to inspect raw string values.
- Produces: `getUserDetailsFieldErrors(details): { age?: string, phoneNumber?: string, studentId?: string }`

- [ ] **Step 1: Add failing boundary tests**

Add tests asserting that blank age is missing, age `0` is present but invalid, valid age is a positive integer, phone matches only `010-0000-0000`, and student ID length is exactly 10.

```js
import { getUserDetailsFieldErrors } from './userDetailsValidation.js';

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
  assert.equal(getUserDetailsFieldErrors({ ...completeDetails, age: '20.5' }).age, '나이가 올바르지 않습니다.');
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `node --test src/pages/UserDetails/userDetailsValidation.test.js`

Expected: FAIL because age `0` is still treated as missing and `getUserDetailsFieldErrors` does not exist.

- [ ] **Step 3: Implement minimal validation**

```js
const requiredFields = [
  'realName',
  'age',
  'gender',
  'phoneNumber',
  'studentId',
  'department',
];

export function hasMissingUserDetails(details) {
  return requiredFields.some(
    (field) => String(details[field] ?? '').trim() === '',
  );
}

export function getUserDetailsFieldErrors(details) {
  const errors = {};
  const age = Number(details.age);

  if (!Number.isInteger(age) || age <= 0) {
    errors.age = '나이가 올바르지 않습니다.';
  }
  if (!/^010-\d{4}-\d{4}$/.test(String(details.phoneNumber))) {
    errors.phoneNumber = '전화번호 형식이 올바르지 않습니다.';
  }
  if (String(details.studentId).length !== 10) {
    errors.studentId = '학번 형식이 올바르지 않습니다.';
  }

  return errors;
}
```

- [ ] **Step 4: Run tests and verify pass**

Run: `node --test src/pages/UserDetails/userDetailsValidation.test.js`

Expected: all validation tests PASS.

---

### Task 2: Inline error UI and UserDetails flow

**Files:**
- Modify: `src/pages/UserDetails/components/InlineInput.jsx`
- Create: `src/pages/UserDetails/components/inlineInputError.test.js`
- Modify: `src/pages/UserDetails/UserDetails.jsx`
- Create: `src/pages/UserDetails/userDetailsFieldValidation.test.js`

**Interfaces:**
- Adds: `errorMessage?: string` to `InlineInput`.
- Consumes: `getUserDetailsFieldErrors(details)` from Task 1.

- [ ] **Step 1: Write failing UI and flow source tests**

`inlineInputError.test.js` checks that `InlineInput` accepts `errorMessage`, renders it with `role="alert"`, and contains `text-fg-error text-xs font-bold`.

`userDetailsFieldValidation.test.js` checks:

```js
assert.match(source, /getUserDetailsFieldErrors\(formValues\)/);
assert.match(source, /setIsFormatValidationActive\(true\)/);
assert.match(source, /errorMessage=\{fieldErrors\.age\}/);
assert.match(source, /errorMessage=\{fieldErrors\.phoneNumber\}/);
assert.match(source, /errorMessage=\{fieldErrors\.studentId\}/);
assert.ok(missingIndex >= 0 && missingIndex < formatIndex);
assert.ok(formatIndex >= 0 && formatIndex < statusIndex);
```

- [ ] **Step 2: Run source tests and verify failure**

Run: `node --test src/pages/UserDetails/components/inlineInputError.test.js src/pages/UserDetails/userDetailsFieldValidation.test.js`

Expected: FAIL because InlineInput and UserDetails do not yet expose field errors.

- [ ] **Step 3: Add InlineInput error rendering**

Add `errorMessage` to props and render beside the label:

```jsx
{errorMessage && (
    <span
        className="text-fg-error text-xs font-bold"
        role="alert"
    >
        {errorMessage}
    </span>
)}
```

Keep the optional character counter in the same right-side label area.

- [ ] **Step 4: Add UserDetails validation state and live recalculation**

Import `getUserDetailsFieldErrors`. Add:

```jsx
const [fieldErrors, setFieldErrors] = useState({});
const [isFormatValidationActive, setIsFormatValidationActive] = useState(false);
```

Build raw `formValues` before `requestBody`. On missing values, clear field errors, disable format validation, open the modal, and return. Otherwise calculate `nextFieldErrors`, activate format validation, store errors, and return when any error exists.

Use small age, phone, and student ID change handlers that update their value and, when `isFormatValidationActive` is true, call `getUserDetailsFieldErrors` with the next raw form values.

Pass:

```jsx
errorMessage={fieldErrors.age}
errorMessage={fieldErrors.phoneNumber}
errorMessage={fieldErrors.studentId}
```

to the matching inputs.

- [ ] **Step 5: Run focused tests**

Run: `node --test src/pages/UserDetails/userDetailsValidation.test.js src/pages/UserDetails/components/inlineInputError.test.js src/pages/UserDetails/userDetailsFieldValidation.test.js src/pages/UserDetails/userDetailsSubmit.test.js`

Expected: all focused tests PASS.

- [ ] **Step 6: Run repository verification**

Run: `npm.cmd run lint`

Expected: exit code 0.

Run: `npm.cmd run build`

Expected: exit code 0.

- [ ] **Step 7: Review and commit**

Run: `git diff --check`

Expected: no whitespace errors.

```bash
git add src/pages/UserDetails/UserDetails.jsx src/pages/UserDetails/userDetailsValidation.js src/pages/UserDetails/userDetailsValidation.test.js src/pages/UserDetails/components/InlineInput.jsx src/pages/UserDetails/components/inlineInputError.test.js src/pages/UserDetails/userDetailsFieldValidation.test.js
git commit -m "feat: validate user detail field formats"
```
