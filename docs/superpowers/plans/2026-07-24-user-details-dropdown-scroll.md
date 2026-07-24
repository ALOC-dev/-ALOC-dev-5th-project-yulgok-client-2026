# UserDetails Dropdown Auto-Scroll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure an opened UserDetails dropdown is fully visible by smoothly scrolling the page only by the amount its menu overflows the viewport.

**Architecture:** Put the viewport-overflow calculation in a focused pure function so boundary behavior can be tested without a browser DOM. In `DropDownMenu`, measure the rendered listbox on the next animation frame and call `window.scrollBy` only when the calculated offset is positive.

**Tech Stack:** React 19, JavaScript ES modules, Node test runner, Vite

## Global Constraints

- Apply the behavior to dropdowns opened by mouse or keyboard.
- Preserve 16px between the menu bottom and viewport bottom.
- Use smooth page scrolling only when the menu overflows.
- Preserve existing option sorting, selection, keyboard navigation, and internal option scrolling.

---

### Task 1: Dropdown viewport overflow calculation

**Files:**
- Create: `src/pages/UserDetails/components/getDropdownScrollOffset.js`
- Create: `src/pages/UserDetails/components/getDropdownScrollOffset.test.js`

**Interfaces:**
- Consumes: menu bottom coordinate, viewport height, and an optional bottom margin.
- Produces: `getDropdownScrollOffset(menuBottom, viewportHeight, bottomMargin = 16)`, returning a non-negative number.

- [ ] **Step 1: Write the failing test**

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { getDropdownScrollOffset } from './getDropdownScrollOffset.js';

test('returns only the distance needed to reveal the dropdown with margin', () => {
  assert.equal(getDropdownScrollOffset(780, 720), 76);
});

test('returns zero when the dropdown already fits in the viewport', () => {
  assert.equal(getDropdownScrollOffset(680, 720), 0);
  assert.equal(getDropdownScrollOffset(704, 720), 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/pages/UserDetails/components/getDropdownScrollOffset.test.js`

Expected: FAIL because `getDropdownScrollOffset.js` does not exist.

- [ ] **Step 3: Write minimal implementation**

```js
export function getDropdownScrollOffset(
  menuBottom,
  viewportHeight,
  bottomMargin = 16,
) {
  return Math.max(0, menuBottom + bottomMargin - viewportHeight);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/pages/UserDetails/components/getDropdownScrollOffset.test.js`

Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/pages/UserDetails/components/getDropdownScrollOffset.js src/pages/UserDetails/components/getDropdownScrollOffset.test.js
git commit -m "test: define dropdown scroll offset"
```

### Task 2: Smoothly reveal the opened listbox

**Files:**
- Modify: `src/pages/UserDetails/components/DropDownMenu.jsx`
- Create: `src/pages/UserDetails/components/dropDownMenuScroll.test.js`

**Interfaces:**
- Consumes: `getDropdownScrollOffset(menuBottom, viewportHeight)`.
- Produces: an open-state effect that measures `listboxRef.current.getBoundingClientRect().bottom` and conditionally calls `window.scrollBy`.

- [ ] **Step 1: Write the failing integration guard**

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('DropDownMenu smoothly scrolls only when its opened listbox overflows', async () => {
  const source = await readFile(
    new URL('./DropDownMenu.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /getDropdownScrollOffset/);
  assert.match(source, /requestAnimationFrame/);
  assert.match(source, /getBoundingClientRect\(\)\.bottom/);
  assert.match(source, /window\.scrollBy\(\{\s*top: scrollOffset,\s*behavior: "smooth"/s);
  assert.match(source, /cancelAnimationFrame/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/pages/UserDetails/components/dropDownMenuScroll.test.js`

Expected: FAIL because `DropDownMenu.jsx` does not yet contain the measurement and page-scroll effect.

- [ ] **Step 3: Write minimal implementation**

Add the helper import:

```js
import { getDropdownScrollOffset } from "./getDropdownScrollOffset.js";
```

Add a listbox ref:

```js
const listboxRef = useRef(null);
```

Add the open-state effect:

```js
useEffect(() => {
    if (!isOpen) return undefined;

    const animationFrameId = window.requestAnimationFrame(() => {
        const menuBottom = listboxRef.current?.getBoundingClientRect().bottom;
        if (menuBottom === undefined) return;

        const scrollOffset = getDropdownScrollOffset(
            menuBottom,
            window.innerHeight,
        );

        if (scrollOffset > 0) {
            window.scrollBy({
                top: scrollOffset,
                behavior: "smooth",
            });
        }
    });

    return () => window.cancelAnimationFrame(animationFrameId);
}, [isOpen]);
```

Attach `ref={listboxRef}` to the listbox `<ul>`.

- [ ] **Step 4: Run focused tests**

Run: `node --test src/pages/UserDetails/components/getDropdownScrollOffset.test.js src/pages/UserDetails/components/dropDownMenuScroll.test.js`

Expected: 3 tests pass.

- [ ] **Step 5: Run project verification**

Run: `node --test`

Expected: all Node tests pass.

Run: `npm run lint`

Expected: ESLint exits successfully.

Run: `npm run build`

Expected: Vite production build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/pages/UserDetails/components/DropDownMenu.jsx src/pages/UserDetails/components/dropDownMenuScroll.test.js
git commit -m "feat: reveal opened user details dropdown"
```
