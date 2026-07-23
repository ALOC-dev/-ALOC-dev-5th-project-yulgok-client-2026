# SurveyIntroduce Character Count Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render live `current/max` character counters beside the nickname and introduction labels in SurveyIntroduce.

**Architecture:** Extend `InlineInput` and `TextArea` with one optional `showCharacterCount` prop. Each component derives the current length from its controlled value and renders the counter only when the prop is enabled and `maxLength` is numeric; SurveyIntroduce opts into the behavior for exactly two fields.

**Tech Stack:** React 19, Node.js built-in test runner, Tailwind CSS, ESLint, Vite

## Global Constraints

- Count spaces and line breaks with `String(value ?? '').length`.
- Display nickname as `current/8`.
- Display introduction as `current/200`.
- Change the introduction `maxLength` from `500` to `200`.
- Keep existing submit-time length validation.
- Do not show counters in other input usages unless they explicitly pass `showCharacterCount`.
- Preserve the user's existing uncommitted change in `src/api/users/users.js`.

---

### Task 1: Optional character counters and SurveyIntroduce wiring

**Files:**
- Create: `src/pages/Surveys/components/characterCount.test.js`
- Modify: `src/pages/UserDetails/components/InlineInput.jsx`
- Modify: `src/pages/Surveys/components/TextArea.jsx`
- Modify: `src/pages/Surveys/SurveyIntroduce.jsx`

**Interfaces:**
- Adds: `showCharacterCount?: boolean` to `InlineInput`
- Adds: `showCharacterCount?: boolean` to `TextArea`
- Consumes: existing controlled `value` and numeric `maxLength` props.

- [ ] **Step 1: Write a failing source contract test**

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('input components support opt-in current/max character counters', async () => {
  const inlineInputSource = await readFile(
    new URL('../../UserDetails/components/InlineInput.jsx', import.meta.url),
    'utf8',
  );
  const textAreaSource = await readFile(
    new URL('./TextArea.jsx', import.meta.url),
    'utf8',
  );

  for (const source of [inlineInputSource, textAreaSource]) {
    assert.match(source, /showCharacterCount/);
    assert.match(source, /String\(value \?\? ''\)\.length/);
    assert.match(source, /\{currentLength\}\/\{maxLength\}/);
  }
});

test('SurveyIntroduce enables 8 and 200 character counters', async () => {
  const source = await readFile(
    new URL('../SurveyIntroduce.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /name="nickname"[\s\S]*?maxLength=\{8\}[\s\S]*?showCharacterCount/);
  assert.match(source, /<TextArea[\s\S]*?maxLength=\{200\}[\s\S]*?showCharacterCount/);
  assert.doesNotMatch(source, /maxLength=\{500\}/);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node --test src/pages/Surveys/components/characterCount.test.js`

Expected: both tests FAIL because the components and page do not yet expose or use `showCharacterCount`.

- [ ] **Step 3: Add the optional InlineInput counter**

Add `showCharacterCount = false` to the `InlineInput` props and derive:

```jsx
const currentLength = String(value ?? '').length;
const shouldShowCharacterCount = showCharacterCount && Number.isInteger(maxLength);
```

Replace the label with a row that preserves the current label style:

```jsx
<div className="flex items-center justify-between gap-2">
    <label
        htmlFor={inputId}
        className={labelStyle || "font-heading font-semibold text-xs text-fg-basic-muted"}
    >
        {label}
    </label>
    {shouldShowCharacterCount && (
        <span className="shrink-0 font-sans text-xs font-normal text-fg-basic-muted">
            {currentLength}/{maxLength}
        </span>
    )}
</div>
```

- [ ] **Step 4: Add the optional TextArea counter**

Add `showCharacterCount = false` to the `TextArea` props and derive the same `currentLength` and `shouldShowCharacterCount` values.

Replace its label with:

```jsx
<div className="flex items-center justify-between gap-2">
    <label className="block text-sm font-sans font-bold text-fg-basic">
        {label}
        {required && <span className="ml-1 text-[#c04a67]" aria-hidden="true">*</span>}
    </label>
    {shouldShowCharacterCount && (
        <span className="shrink-0 font-sans text-xs font-normal text-fg-basic-muted">
            {currentLength}/{maxLength}
        </span>
    )}
</div>
```

- [ ] **Step 5: Enable both SurveyIntroduce counters**

Add `showCharacterCount` after `maxLength={8}` on the nickname `InlineInput`.

Change the introduction props to:

```jsx
required
maxLength={200}
showCharacterCount
```

- [ ] **Step 6: Run focused regression tests**

Run: `node --test src/pages/Surveys/components/characterCount.test.js src/pages/UserDetails/components/inlineInputAdornment.test.js src/pages/Surveys/surveyIntroduceValidation.test.js src/pages/Surveys/surveyPageLayout.test.js`

Expected: 7 tests PASS and 0 tests FAIL.

- [ ] **Step 7: Run repository verification**

Run: `npm.cmd run lint`

Expected: command exits with code 0 and reports no ESLint errors.

Run: `npm.cmd run build`

Expected: Vite build exits with code 0 and writes the production bundle.

- [ ] **Step 8: Review and commit only task files**

Run: `git diff --check`

Expected: no whitespace errors.

```bash
git add src/pages/Surveys/components/characterCount.test.js src/pages/UserDetails/components/InlineInput.jsx src/pages/Surveys/components/TextArea.jsx src/pages/Surveys/SurveyIntroduce.jsx
git commit -m "feat: show survey introduction character counts"
```
