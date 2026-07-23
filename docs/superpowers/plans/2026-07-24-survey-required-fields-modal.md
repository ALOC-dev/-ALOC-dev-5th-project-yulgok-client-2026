# Survey Required Fields Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show one shared required-fields modal when SurveySleep, SurveyClean, or SurveyLiving has an unanswered item, while removing their inline error messages.

**Architecture:** Add a focused `RequiredFieldsModal` wrapper around the existing compound `Modal`, with fixed copy and no footer. Each page continues to own only its open state and existing integer-based completeness check; UserDetails switches to the same wrapper so all four pages share identical UI behavior.

**Tech Stack:** React 19, shared React `Modal`, Node.js built-in test runner, ESLint, Vite

## Global Constraints

- Display the exact title `입력 확인`.
- Display the exact body copy `모든 항목은 필수 입력입니다.`.
- Do not render a footer confirmation button.
- Allow dismissal through the top-right close button, overlay click, and Escape key.
- Preserve the current `Number.isInteger` completeness checks in SurveySleep, SurveyClean, and SurveyLiving.
- Do not save or navigate after a failed completeness check.
- Remove the three survey pages' `errorMessage` state and inline error paragraphs.
- Preserve the user's existing uncommitted change in `src/api/users/users.js`.

---

### Task 1: Shared RequiredFieldsModal

**Files:**
- Create: `src/components/RequiredFieldsModal.jsx`
- Create: `src/components/RequiredFieldsModal.test.js`

**Interfaces:**
- Consumes: `open: boolean`
- Consumes: `onClose: () => void`
- Produces: a controlled modal with fixed title/body copy and the shared modal's default dismissal behavior.

- [ ] **Step 1: Write the failing shared-component source test**

```js
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
```

- [ ] **Step 2: Run the test to verify it fails because the component is absent**

Run: `node --test src/components/RequiredFieldsModal.test.js`

Expected: FAIL with `ENOENT` for `RequiredFieldsModal.jsx`.

- [ ] **Step 3: Implement the minimal shared component**

```jsx
import { Modal } from './Modal/index.js';

function RequiredFieldsModal({ open, onClose }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="입력 확인"
      size="small"
    >
      <p className="m-0 text-sm text-fg-basic">
        모든 항목은 필수 입력입니다.
      </p>
    </Modal>
  );
}

export default RequiredFieldsModal;
```

- [ ] **Step 4: Run the shared-component test and verify it passes**

Run: `node --test src/components/RequiredFieldsModal.test.js`

Expected: 1 test PASS and 0 tests FAIL.

- [ ] **Step 5: Commit the independently working shared component**

```bash
git add src/components/RequiredFieldsModal.jsx src/components/RequiredFieldsModal.test.js
git commit -m "feat: add shared required fields modal"
```

---

### Task 2: Survey pages and UserDetails integration

**Files:**
- Modify: `src/components/RequiredFieldsModal.test.js`
- Modify: `src/pages/UserDetails/UserDetails.jsx`
- Modify: `src/pages/UserDetails/userDetailsValidation.test.js`
- Modify: `src/pages/Surveys/SurveySleep.jsx`
- Modify: `src/pages/Surveys/SurveyClean.jsx`
- Modify: `src/pages/Surveys/SurveyLiving.jsx`

**Interfaces:**
- Consumes: `RequiredFieldsModal({ open, onClose })` from Task 1.
- Preserves: `hasMissingUserDetails(details)` and `isBadRequest(error)` in the UserDetails flow.
- Produces: page-local `showRequiredFieldsModal` state on all four pages.

- [ ] **Step 1: Add a failing integration source test**

Append to `src/components/RequiredFieldsModal.test.js`:

```js
const requiredModalPagePaths = [
  new URL('../pages/UserDetails/UserDetails.jsx', import.meta.url),
  new URL('../pages/Surveys/SurveySleep.jsx', import.meta.url),
  new URL('../pages/Surveys/SurveyClean.jsx', import.meta.url),
  new URL('../pages/Surveys/SurveyLiving.jsx', import.meta.url),
];

test('required pages use RequiredFieldsModal without inline error state', async () => {
  for (const pagePath of requiredModalPagePaths) {
    const source = await readFile(pagePath, 'utf8');

    assert.match(source, /<RequiredFieldsModal/);
    assert.match(source, /setShowRequiredFieldsModal\(true\)/);
    assert.doesNotMatch(source, /errorMessage/);
    assert.doesNotMatch(source, /<Modal[\s>]/);
  }
});
```

Update the modal assertion in `src/pages/UserDetails/userDetailsValidation.test.js`:

```js
assert.match(source, /<RequiredFieldsModal/);
```

Remove its direct-modal assertions for `title`, body copy, and `Modal.Footer`, because Task 1 now owns those requirements.

- [ ] **Step 2: Run the integration tests and verify they fail**

Run: `node --test src/components/RequiredFieldsModal.test.js src/pages/UserDetails/userDetailsValidation.test.js`

Expected: shared-component test PASS; page integration tests FAIL because the pages do not yet use `RequiredFieldsModal`.

- [ ] **Step 3: Replace the direct UserDetails modal with the wrapper**

In `src/pages/UserDetails/UserDetails.jsx`, remove:

```jsx
import { Modal } from '../../components/Modal/index.js';
```

Add:

```jsx
import RequiredFieldsModal from '../../components/RequiredFieldsModal.jsx';
```

Replace the direct `<Modal>` block with:

```jsx
<RequiredFieldsModal
    open={showRequiredFieldsModal}
    onClose={() => setShowRequiredFieldsModal(false)}
/>
```

- [ ] **Step 4: Integrate the wrapper in SurveySleep**

In `src/pages/Surveys/SurveySleep.jsx`, import:

```jsx
import RequiredFieldsModal from '../../components/RequiredFieldsModal.jsx';
```

Replace:

```jsx
const [errorMessage, setErrorMessage] = useState('');
```

with:

```jsx
const [showRequiredFieldsModal, setShowRequiredFieldsModal] = useState(false);
```

In the failed completeness branch, replace the inline-message setter with:

```jsx
setShowRequiredFieldsModal(true);
```

Remove `setErrorMessage('');` and the conditional inline-error paragraph. Render this as the final child of `<main>`:

```jsx
<RequiredFieldsModal
    open={showRequiredFieldsModal}
    onClose={() => setShowRequiredFieldsModal(false)}
/>
```

- [ ] **Step 5: Integrate the wrapper in SurveyClean**

In `src/pages/Surveys/SurveyClean.jsx`, import:

```jsx
import RequiredFieldsModal from '../../components/RequiredFieldsModal.jsx';
```

Replace:

```jsx
const [errorMessage, setErrorMessage] = useState('');
```

with:

```jsx
const [showRequiredFieldsModal, setShowRequiredFieldsModal] = useState(false);
```

In the failed two-answer completeness branch, replace the inline-message setter with:

```jsx
setShowRequiredFieldsModal(true);
```

Remove `setErrorMessage('');` and the conditional inline-error paragraph. Render this as the final child of `<main>`:

```jsx
<RequiredFieldsModal
    open={showRequiredFieldsModal}
    onClose={() => setShowRequiredFieldsModal(false)}
/>
```

- [ ] **Step 6: Integrate the wrapper in SurveyLiving**

In `src/pages/Surveys/SurveyLiving.jsx`, import:

```jsx
import RequiredFieldsModal from '../../components/RequiredFieldsModal.jsx';
```

Replace:

```jsx
const [errorMessage, setErrorMessage] = useState('');
```

with:

```jsx
const [showRequiredFieldsModal, setShowRequiredFieldsModal] = useState(false);
```

In the failed five-answer completeness branch, replace the inline-message setter with:

```jsx
setShowRequiredFieldsModal(true);
```

Remove `setErrorMessage('');` and the conditional inline-error paragraph. Render this as the final child of `<main>`:

```jsx
<RequiredFieldsModal
    open={showRequiredFieldsModal}
    onClose={() => setShowRequiredFieldsModal(false)}
/>
```

- [ ] **Step 7: Run all focused Node tests**

Run: `node --test src/components/RequiredFieldsModal.test.js src/pages/UserDetails/userDetailsValidation.test.js src/pages/Surveys/surveyPageLayout.test.js`

Expected: 6 tests PASS and 0 tests FAIL.

- [ ] **Step 8: Run repository verification**

Run: `npm.cmd run lint`

Expected: command exits with code 0 and reports no ESLint errors.

Run: `npm.cmd run build`

Expected: Vite build exits with code 0 and writes the production bundle.

- [ ] **Step 9: Review the diff and commit only the integration files**

Run: `git diff --check`

Expected: no whitespace errors.

```bash
git add src/components/RequiredFieldsModal.test.js src/pages/UserDetails/UserDetails.jsx src/pages/UserDetails/userDetailsValidation.test.js src/pages/Surveys/SurveySleep.jsx src/pages/Surveys/SurveyClean.jsx src/pages/Surveys/SurveyLiving.jsx
git commit -m "fix: show required modal for incomplete surveys"
```
