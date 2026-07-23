# Selectable Button Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make selected radio and multiple-choice buttons retain a white background, use brand-primary borders and text, show a leading check, and briefly shrink while pressed.

**Architecture:** Keep the existing `RadioBtnGroup` and `MultipleBtnGroup` state APIs unchanged. Apply matching Tailwind state classes and accessible conditional check markup directly to each component because their sizing and selection behavior differ.

**Tech Stack:** React 19, Tailwind CSS 4, Node.js built-in test runner

## Global Constraints

- Only `RadioBtnGroup` and `MultipleBtnGroup` selection buttons change.
- Selection logic, maximum selection behavior, and `aria-pressed` remain unchanged.
- The check is decorative and must use `aria-hidden="true"`.
- No new dependency or shared component is introduced.

---

### Task 1: Selection Button Visual Feedback

**Files:**
- Create: `src/components/selectableButtonFeedback.test.js`
- Modify: `src/components/RadioBtnGroup.jsx`
- Modify: `src/pages/Surveys/components/MultipleBtnGroup.jsx`

**Interfaces:**
- Consumes: Existing `items`, `value`, and `onChange` props in both components.
- Produces: Existing button markup with selected-state classes, conditional decorative check, and pressed transform feedback.

- [ ] **Step 1: Write the failing source contract test**

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const componentPaths = [
    new URL('./RadioBtnGroup.jsx', import.meta.url),
    new URL('../pages/Surveys/components/MultipleBtnGroup.jsx', import.meta.url),
];

test('selection buttons use outlined brand styling, a decorative check, and press feedback', async () => {
    for (const componentPath of componentPaths) {
        const source = await readFile(componentPath, 'utf8');

        assert.match(source, /bg-white border-brand-primary text-brand-primary/);
        assert.match(source, /aria-hidden="true">✓/);
        assert.match(source, /transition-transform/);
        assert.match(source, /active:scale-95/);
        assert.match(source, /aria-pressed=\{isSelected\}/);
        assert.doesNotMatch(source, /bg-brand-primary text-white/);
    }
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test src/components/selectableButtonFeedback.test.js`

Expected: FAIL because both components still contain `bg-brand-primary text-white` and lack the decorative check and press feedback.

- [ ] **Step 3: Implement the minimal visual changes**

In both component button class lists, add `transition-transform active:scale-95`, and replace the selected classes with:

```jsx
isSelected
    ? "border-brand-primary bg-white text-brand-primary"
    : "border-transparent bg-white text-fg-basic"
```

Replace the plain item rendering in both components with:

```jsx
{isSelected && <span aria-hidden="true">✓ </span>}
{item}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node --test src/components/selectableButtonFeedback.test.js`

Expected: PASS.

- [ ] **Step 5: Run project verification**

Run: `node --test src/**/*.test.js`

Expected: All discovered tests pass.

Run: `npm run lint`

Expected: ESLint exits successfully.

Run: `npm run build`

Expected: Vite production build exits successfully.

- [ ] **Step 6: Commit the implementation**

```bash
git add src/components/selectableButtonFeedback.test.js src/components/RadioBtnGroup.jsx src/pages/Surveys/components/MultipleBtnGroup.jsx docs/superpowers/plans/2026-07-24-selectable-button-feedback.md
git commit -m "feat: refine selectable button feedback"
```
