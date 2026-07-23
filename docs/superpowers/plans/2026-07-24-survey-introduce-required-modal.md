# SurveyIntroduce Required Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the shared required-fields modal before submission when SurveyIntroduce data is incomplete and after either submission API returns HTTP 400.

**Architecture:** Put the deterministic current-page completeness and HTTP 400 checks in a page-local validation module that can be tested with Node's built-in runner. `SurveyIntroduce` keeps its existing length validation and non-400 inline error path, while one modal state handles current-page omissions, incomplete prior survey drafts, and 400 responses.

**Tech Stack:** React 19, Axios-style errors, shared `RequiredFieldsModal`, Node.js built-in test runner, ESLint, Vite

## Global Constraints

- Treat blank nickname, blank introduction, and an empty visible-profile selection as missing.
- Treat any prior survey page reported by `getFirstIncompleteSurveyPath` as incomplete.
- Do not call `changeNickname` or `postSurveys` when any required input is incomplete.
- Show `RequiredFieldsModal` for HTTP 400 from either `changeNickname` or `postSurveys`.
- Keep inline errors for nickname over 8 characters, introduction over 200 characters, and non-400 API failures.
- Clear stale inline error text before opening the required-fields modal.
- Preserve the existing successful refresh, draft clearing, and `/certification` navigation flow.
- Preserve the user's existing uncommitted change in `src/api/users/users.js`.

---

### Task 1: SurveyIntroduce validation and modal integration

**Files:**
- Create: `src/pages/Surveys/surveyIntroduceValidation.js`
- Create: `src/pages/Surveys/surveyIntroduceValidation.test.js`
- Modify: `src/pages/Surveys/SurveyIntroduce.jsx`

**Interfaces:**
- Produces: `hasMissingSurveyIntroduceFields({ nickname, introduce, visibleProfileFields }): boolean`
- Produces: `isSurveyBadRequest(error: unknown): boolean`
- Consumes: `RequiredFieldsModal({ open, onClose })`

- [ ] **Step 1: Write failing validation tests**

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  hasMissingSurveyIntroduceFields,
  isSurveyBadRequest,
} from './surveyIntroduceValidation.js';

const completeFields = {
  nickname: '이룸매',
  introduce: '안녕하세요.',
  visibleProfileFields: ['BEDTIME'],
};

test('detects missing SurveyIntroduce required fields', () => {
  assert.equal(hasMissingSurveyIntroduceFields(completeFields), false);
  assert.equal(hasMissingSurveyIntroduceFields({ ...completeFields, nickname: '   ' }), true);
  assert.equal(hasMissingSurveyIntroduceFields({ ...completeFields, introduce: '' }), true);
  assert.equal(hasMissingSurveyIntroduceFields({ ...completeFields, visibleProfileFields: [] }), true);
});

test('recognizes only HTTP 400 as a SurveyIntroduce bad request', () => {
  assert.equal(isSurveyBadRequest({ response: { status: 400 } }), true);
  assert.equal(isSurveyBadRequest({ response: { status: 500 } }), false);
  assert.equal(isSurveyBadRequest(new Error('network failure')), false);
});
```

- [ ] **Step 2: Run the tests and verify the missing module failure**

Run: `node --test src/pages/Surveys/surveyIntroduceValidation.test.js`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `surveyIntroduceValidation.js`.

- [ ] **Step 3: Implement the minimal validation module**

```js
export function hasMissingSurveyIntroduceFields({
  nickname,
  introduce,
  visibleProfileFields,
}) {
  return (
    !nickname.trim()
    || !introduce.trim()
    || visibleProfileFields.length < 1
  );
}

export function isSurveyBadRequest(error) {
  return error?.response?.status === 400;
}
```

- [ ] **Step 4: Run the validation tests and verify they pass**

Run: `node --test src/pages/Surveys/surveyIntroduceValidation.test.js`

Expected: 2 tests PASS and 0 tests FAIL.

- [ ] **Step 5: Add a failing SurveyIntroduce source contract test**

Append to `src/pages/Surveys/surveyIntroduceValidation.test.js`:

```js
import { readFile } from 'node:fs/promises';

test('SurveyIntroduce opens the required modal before requests and on HTTP 400', async () => {
  const source = await readFile(
    new URL('./SurveyIntroduce.jsx', import.meta.url),
    'utf8',
  );
  const missingCheckIndex = source.indexOf('hasMissingSurveyIntroduceFields({');
  const incompleteDraftIndex = source.indexOf('if (incompletePagePath)');
  const firstRequestIndex = source.indexOf('await changeNickname');

  assert.match(source, /<RequiredFieldsModal/);
  assert.match(source, /isSurveyBadRequest\(error\)/);
  assert.doesNotMatch(source, /navigate\(incompletePagePath\)/);
  assert.ok(missingCheckIndex >= 0 && missingCheckIndex < firstRequestIndex);
  assert.ok(incompleteDraftIndex >= 0 && incompleteDraftIndex < firstRequestIndex);
});
```

- [ ] **Step 6: Run the focused tests and verify the integration test fails**

Run: `node --test src/pages/Surveys/surveyIntroduceValidation.test.js`

Expected: the first 2 tests PASS and the source contract test FAIL because `SurveyIntroduce.jsx` does not yet use the shared modal or validation helpers.

- [ ] **Step 7: Integrate preflight and 400 modal handling**

In `src/pages/Surveys/SurveyIntroduce.jsx`, add:

```jsx
import RequiredFieldsModal from '../../components/RequiredFieldsModal.jsx';
import {
    hasMissingSurveyIntroduceFields,
    isSurveyBadRequest,
} from './surveyIntroduceValidation.js';
```

Add state:

```jsx
const [showRequiredFieldsModal, setShowRequiredFieldsModal] = useState(false);
```

Replace the three separate missing-field branches with:

```jsx
if (hasMissingSurveyIntroduceFields({ nickname, introduce, visibleProfileFields })) {
    setErrorMessage('');
    setShowRequiredFieldsModal(true);
    return;
}
```

Keep the nickname and introduction length checks after this missing-field branch.

Replace the incomplete-draft branch with:

```jsx
if (incompletePagePath) {
    setErrorMessage('');
    setShowRequiredFieldsModal(true);
    return;
}
```

At the start of the catch block, after the existing console log, add:

```jsx
if (isSurveyBadRequest(error)) {
    setErrorMessage('');
    setShowRequiredFieldsModal(true);
    return;
}
```

Keep `setErrorMessage(getSurveyErrorMessage(error));` for non-400 failures. Render this as the final child of `<main>`:

```jsx
<RequiredFieldsModal
    open={showRequiredFieldsModal}
    onClose={() => setShowRequiredFieldsModal(false)}
/>
```

- [ ] **Step 8: Run focused and regression tests**

Run: `node --test src/pages/Surveys/surveyIntroduceValidation.test.js src/components/RequiredFieldsModal.test.js src/pages/Surveys/surveyPageLayout.test.js`

Expected: 6 tests PASS and 0 tests FAIL.

- [ ] **Step 9: Run repository verification**

Run: `npm.cmd run lint`

Expected: command exits with code 0 and reports no ESLint errors.

Run: `npm.cmd run build`

Expected: Vite build exits with code 0 and writes the production bundle.

- [ ] **Step 10: Review and commit only task files**

Run: `git diff --check`

Expected: no whitespace errors.

```bash
git add src/pages/Surveys/SurveyIntroduce.jsx src/pages/Surveys/surveyIntroduceValidation.js src/pages/Surveys/surveyIntroduceValidation.test.js
git commit -m "fix: show required modal during survey submission"
```
