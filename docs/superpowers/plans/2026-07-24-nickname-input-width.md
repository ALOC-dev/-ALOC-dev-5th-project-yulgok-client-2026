# Nickname Input Width Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Limit the nickname input to a compact width that fits eight characters and the embedded dice button.

**Architecture:** Apply a page-local `w-48 max-w-full` wrapper around the nickname `InlineInput`. Keep the shared input component and all other input widths unchanged.

**Tech Stack:** React 19, Tailwind CSS 4, Node.js built-in test runner

## Global Constraints

- Change only the nickname input width.
- Preserve the embedded dice button, eight-character limit, and accessibility label.
- Do not add props or dependencies.

---

### Task 1: Compact Nickname Width

**Files:**
- Modify: `src/pages/UserDetails/components/inlineInputAdornment.test.js`
- Modify: `src/pages/Surveys/SurveyIntroduce.jsx`

**Interfaces:**
- Consumes: Existing nickname `InlineInput`.
- Produces: A `w-48 max-w-full` page-local width constraint.

- [ ] **Step 1: Add a failing contract assertion**

Add:

```js
assert.match(surveySource, /<div className="w-48 max-w-full">[\s\S]*?<InlineInput/);
```

- [ ] **Step 2: Run focused test and verify RED**

Run: `node --test src/pages/UserDetails/components/inlineInputAdornment.test.js`

Expected: FAIL because the nickname input has no width wrapper.

- [ ] **Step 3: Add the width wrapper**

Wrap only the nickname `InlineInput` in:

```jsx
<div className="w-48 max-w-full">
    <InlineInput ... />
</div>
```

- [ ] **Step 4: Verify**

Run: `node --test src/pages/UserDetails/components/inlineInputAdornment.test.js`

Expected: PASS.

Run: `node --test src/**/*.test.js`

Expected: All tests pass.

Run: `npm.cmd run lint`

Expected: ESLint exits successfully.

Run: `npm.cmd run build`

Expected: Vite production build exits successfully.

- [ ] **Step 5: Commit**

```bash
git add src/pages/UserDetails/components/inlineInputAdornment.test.js src/pages/Surveys/SurveyIntroduce.jsx docs/superpowers/plans/2026-07-24-nickname-input-width.md
git commit -m "style: constrain nickname input width"
```
