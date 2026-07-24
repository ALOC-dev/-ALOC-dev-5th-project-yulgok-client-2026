# Slider Description Row Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Place slider endpoint descriptions and intermediate index labels at one shared height, centered beneath their corresponding numeric indices.

**Architecture:** Build one `displayedIndexLabels` object inside `Slider` by combining endpoint descriptions with explicit `indexLabels`. Feed that object through the existing absolute-position renderer so values 1, 3, and 5 share the same top position, percentage calculation, and center transform.

**Tech Stack:** React 19, JavaScript ES modules, Tailwind CSS, Node test runner, Vite

## Global Constraints

- Align the vertical position of endpoint descriptions with the `보통` label.
- Center labels beneath numeric indices 1, 3, and 5.
- Preserve the existing `leftDescription`, `rightDescription`, and `indexLabels` props.
- Preserve the bedtime slider's two-line labels.
- Explicit `indexLabels` values take precedence over endpoint descriptions at the same index.

---

### Task 1: Merge endpoint descriptions into the positioned label row

**Files:**
- Modify: `src/pages/Surveys/components/Slider.jsx`
- Modify: `src/pages/Surveys/components/sliderIndexLabels.test.js`

**Interfaces:**
- Consumes: `leftDescription`, `rightDescription`, and `indexLabels`.
- Produces: `displayedIndexLabels`, with endpoint descriptions at keys `1` and `lastValue` and explicit index labels overriding collisions.

- [ ] **Step 1: Write the failing source-structure test**

Add these assertions to the Slider test:

```js
assert.match(source, /const displayedIndexLabels = \{/);
assert.match(source, /1: leftDescription/);
assert.match(source, /\[lastValue\]: rightDescription/);
assert.match(source, /\.\.\.indexLabels/);
assert.match(source, /displayedIndexLabels\[item\]/);
assert.doesNotMatch(source, /\{\(leftDescription \|\| rightDescription\) && \(/);
```

Keep the existing assertion for:

```js
assert.match(source, /-translate-x-1\/2/);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test src/pages/Surveys/components/sliderIndexLabels.test.js`

Expected: FAIL because endpoint descriptions still render in a separate row.

- [ ] **Step 3: Implement unified positioned labels**

After calculating `lastValue`, add:

```js
const displayedIndexLabels = {
    ...(leftDescription ? { 1: leftDescription } : {}),
    ...(rightDescription ? { [lastValue]: rightDescription } : {}),
    ...indexLabels,
};
```

Calculate label presence from the unified object:

```js
const hasIndexLabels = Object.keys(displayedIndexLabels).length > 0;
```

In the positioned label map, replace:

```js
const indexLabel = indexLabels[item];
```

with:

```js
const indexLabel = displayedIndexLabels[item];
```

Delete the separate `(leftDescription || rightDescription)` description row. Do not change the existing percentage position, `top-0`, or `-translate-x-1/2` classes.

- [ ] **Step 4: Run focused and full verification**

Run: `node --test src/pages/Surveys/components/sliderIndexLabels.test.js`

Expected: all slider index label tests pass.

Run: `node --test`

Expected: all Node tests pass.

Run: `npx.cmd eslint src/pages/Surveys/components/Slider.jsx src/pages/Surveys/components/sliderIndexLabels.test.js`

Expected: changed-file lint exits successfully.

Run: `npm.cmd run build`

Expected: Vite production build succeeds.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/plans/2026-07-24-slider-description-row-alignment.md src/pages/Surveys/components/Slider.jsx src/pages/Surveys/components/sliderIndexLabels.test.js
git commit -m "fix: align slider description labels"
```
