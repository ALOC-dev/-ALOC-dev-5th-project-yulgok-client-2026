# Bedtime Endpoint Label Wrap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the first and last bedtime index labels on two explicit lines so their text remains visible at the screen edges.

**Architecture:** Keep label content in `SurveySleep` and extend the shared `Slider` presentation contract to accept either a string or an array of lines. Render array entries as blocks and increase only the index-label area height to fit two lines.

**Tech Stack:** React 19, JavaScript ES modules, Tailwind CSS, Node test runner, Vite

## Global Constraints

- Render index 1 as `10시` followed by `이전` on the next line.
- Render index 5 as `새벽 1시` followed by `이후` on the next line.
- Keep indices 2 through 4 on one line.
- Preserve centered positioning at each slider index.

---

### Task 1: Multi-line bedtime endpoint labels

**Files:**
- Modify: `src/pages/Surveys/SurveySleep.jsx`
- Modify: `src/pages/Surveys/components/Slider.jsx`
- Modify: `src/pages/Surveys/components/sliderIndexLabels.test.js`

**Interfaces:**
- Consumes: `indexLabels` values that are either strings or arrays of strings.
- Produces: one-line rendering for strings and one block per line for arrays.

- [ ] **Step 1: Update tests to define the desired behavior**

Update the Slider source guard to require array handling, block lines, and a two-line container:

```js
assert.match(source, /Array\.isArray\(indexLabel\)/);
assert.match(source, /indexLabel\.map/);
assert.match(source, /className="block"/);
assert.match(source, /h-8/);
```

Update the SurveySleep assertion to require:

```js
1: ['10시', '이전'],
2: '10시~11시',
3: '11시~12시',
4: '12시~1시',
5: ['새벽 1시', '이후'],
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test src/pages/Surveys/components/sliderIndexLabels.test.js`

Expected: FAIL because `Slider` does not handle arrays and `SurveySleep` still uses single-line endpoint strings.

- [ ] **Step 3: Implement the endpoint label data**

In `SurveySleep.jsx`, change only the endpoint label values:

```js
indexLabels={{
    1: ['10시', '이전'],
    2: '10시~11시',
    3: '11시~12시',
    4: '12시~1시',
    5: ['새벽 1시', '이후'],
}}
```

- [ ] **Step 4: Implement array-aware label rendering**

In the `Slider.jsx` index-label map, assign the current label and render arrays as block lines:

```jsx
{values.map((item) => {
    const indexLabel = indexLabels[item];
    if (!indexLabel) return null;

    return (
        <span
            key={item}
            style={{
                left: lastValue === 1
                    ? "50%"
                    : `${((item - 1) / (lastValue - 1)) * 100}%`,
            }}
            className="absolute top-0 -translate-x-1/2 whitespace-nowrap text-center"
        >
            {Array.isArray(indexLabel)
                ? indexLabel.map((line) => (
                    <span key={line} className="block">{line}</span>
                ))
                : indexLabel}
        </span>
    );
})}
```

Change the index-label container from `h-4` to `h-8`.

- [ ] **Step 5: Run focused and project verification**

Run: `node --test src/pages/Surveys/components/sliderIndexLabels.test.js`

Expected: all slider index label tests pass.

Run: `node --test`

Expected: all Node tests pass.

Run: `npx.cmd eslint src/pages/Surveys/SurveySleep.jsx src/pages/Surveys/components/Slider.jsx src/pages/Surveys/components/sliderIndexLabels.test.js`

Expected: changed-file lint exits successfully, except any explicitly confirmed pre-existing error.

Run: `npm.cmd run build`

Expected: Vite production build succeeds.

- [ ] **Step 6: Commit**

```bash
git add docs/superpowers/plans/2026-07-24-bedtime-endpoint-label-wrap.md src/pages/Surveys/SurveySleep.jsx src/pages/Surveys/components/Slider.jsx src/pages/Surveys/components/sliderIndexLabels.test.js
git commit -m "fix: wrap bedtime endpoint labels"
```
