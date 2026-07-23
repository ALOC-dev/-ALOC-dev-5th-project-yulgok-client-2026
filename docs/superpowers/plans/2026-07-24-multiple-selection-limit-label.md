# Multiple Selection Limit Label Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a small fg-secondary `최대 3개` hint beside the important-items label.

**Architecture:** Render the hint inside `MultipleBtnGroup` from its existing `maxSelections` prop so the displayed count and enforced limit share one source of truth.

**Tech Stack:** React 19, Tailwind CSS 4, Node.js built-in test runner

## Global Constraints

- Preserve the existing label, required mark, selection behavior, and accessibility state.
- Derive the displayed count from `maxSelections`.
- Use `text-xs` and `text-fg-secondary`.
- Do not add dependencies or new component props.

---

### Task 1: Dynamic Maximum Selection Hint

**Files:**
- Modify: `src/components/selectableButtonFeedback.test.js`
- Modify: `src/pages/Surveys/components/MultipleBtnGroup.jsx`

**Interfaces:**
- Consumes: Existing numeric `maxSelections` prop, defaulting to `3`.
- Produces: Label hint text `최대 {maxSelections}개`.

- [ ] **Step 1: Add a failing source contract test**

Add a test that reads `MultipleBtnGroup.jsx` and asserts:

```js
assert.match(source, /최대 \{maxSelections\}개/);
assert.match(source, /ml-2 text-xs font-normal text-fg-secondary/);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test src/components/selectableButtonFeedback.test.js`

Expected: FAIL because the label does not render the limit hint.

- [ ] **Step 3: Add the dynamic hint**

After the required mark in the label, render:

```jsx
<span className="ml-2 text-xs font-normal text-fg-secondary">
    최대 {maxSelections}개
</span>
```

- [ ] **Step 4: Run focused and complete verification**

Run: `node --test src/components/selectableButtonFeedback.test.js`

Expected: PASS.

Run: `node --test src/**/*.test.js`

Expected: All tests pass.

Run: `npm.cmd run lint`

Expected: ESLint exits successfully.

Run: `npm.cmd run build`

Expected: Vite production build exits successfully.

- [ ] **Step 5: Commit**

```bash
git add src/components/selectableButtonFeedback.test.js src/pages/Surveys/components/MultipleBtnGroup.jsx docs/superpowers/plans/2026-07-24-multiple-selection-limit-label.md
git commit -m "feat: show multiple selection limit"
```
