# Survey Fixed Navigation Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep each survey progress bar at the top and navigation buttons at the bottom while only the page body scrolls between them.

**Architecture:** Each `MoveBtnGroup` page becomes a height-constrained flex column. `ProgressBar` and `MoveBtnGroup` remain direct non-scrolling children, while the header, form section, and validation message move into a shared-class scroll region between them.

**Tech Stack:** React 19, Tailwind CSS 4, Node.js built-in test runner

## Global Constraints

- Apply the layout to `UserDetails`, `SurveySleep`, `SurveyClean`, `SurveyLiving`, and `SurveyIntroduce`.
- Keep `ProgressBar` outside and before the scroll region.
- Keep `MoveBtnGroup` outside and after the scroll region.
- Do not change survey state, validation, submission, or navigation behavior.
- Do not introduce new dependencies.

---

### Task 1: Fixed Progress and Navigation Layout

**Files:**
- Create: `src/pages/Surveys/surveyPageLayout.test.js`
- Modify: `src/pages/UserDetails/UserDetails.jsx`
- Modify: `src/pages/Surveys/SurveySleep.jsx`
- Modify: `src/pages/Surveys/SurveyClean.jsx`
- Modify: `src/pages/Surveys/SurveyLiving.jsx`
- Modify: `src/pages/Surveys/SurveyIntroduce.jsx`

**Interfaces:**
- Consumes: Existing page JSX, `ProgressBar`, and `MoveBtnGroup`.
- Produces: A viewport-height page shell with a `data-survey-scroll-region` body between fixed flex siblings.

- [ ] **Step 1: Write the failing layout contract test**

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const pagePaths = [
    new URL('../UserDetails/UserDetails.jsx', import.meta.url),
    new URL('./SurveySleep.jsx', import.meta.url),
    new URL('./SurveyClean.jsx', import.meta.url),
    new URL('./SurveyLiving.jsx', import.meta.url),
    new URL('./SurveyIntroduce.jsx', import.meta.url),
];

test('pages keep progress and navigation outside a bounded scrolling body', async () => {
    for (const pagePath of pagePaths) {
        const source = await readFile(pagePath, 'utf8');
        const progressIndex = source.indexOf('<ProgressBar');
        const scrollIndex = source.indexOf('data-survey-scroll-region');
        const moveIndex = source.indexOf('<MoveBtnGroup');

        assert.match(source, /h-dvh/);
        assert.match(source, /overflow-hidden/);
        assert.match(source, /min-h-0 flex-1 overflow-y-auto/);
        assert.match(source, /shrink-0 bg-brand-background pt-3/);
        assert.ok(progressIndex >= 0 && progressIndex < scrollIndex);
        assert.ok(scrollIndex >= 0 && scrollIndex < moveIndex);
    }
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test src/pages/Surveys/surveyPageLayout.test.js`

Expected: FAIL because the pages use `min-h-dvh`, have no bounded scroll region, and render navigation directly after the growing section.

- [ ] **Step 3: Implement the bounded flex layout**

For each page:

1. Replace the main shell classes with:

```jsx
<main className="flex h-dvh flex-col overflow-hidden bg-brand-background p-5 pb-[calc(16px+env(safe-area-inset-bottom))]">
```

2. Keep `ProgressBar` as the first child.
3. Wrap the header, section, and validation message in:

```jsx
<div
    data-survey-scroll-region
    className="min-h-0 flex-1 overflow-y-auto pb-4"
>
```

4. Keep `MoveBtnGroup` after that wrapper, inside:

```jsx
<div className="shrink-0 bg-brand-background pt-3">
    <MoveBtnGroup ... />
</div>
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node --test src/pages/Surveys/surveyPageLayout.test.js`

Expected: PASS.

- [ ] **Step 5: Run complete verification**

Run: `node --test src/**/*.test.js`

Expected: All tests pass.

Run: `npm.cmd run lint`

Expected: ESLint exits successfully.

Run: `npm.cmd run build`

Expected: Vite production build exits successfully.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Surveys/surveyPageLayout.test.js src/pages/UserDetails/UserDetails.jsx src/pages/Surveys/SurveySleep.jsx src/pages/Surveys/SurveyClean.jsx src/pages/Surveys/SurveyLiving.jsx src/pages/Surveys/SurveyIntroduce.jsx docs/superpowers/plans/2026-07-24-survey-fixed-navigation-layout.md
git commit -m "fix: keep survey navigation visible"
```
