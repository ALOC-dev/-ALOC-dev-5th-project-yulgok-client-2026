# Inline Nickname Dice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Place the random nickname dice button inside the right side of the nickname input without reducing usable text space.

**Architecture:** Extend `InlineInput` with an optional React-node `endAdornment`. The component owns relative positioning and conditional input padding, while `SurveyIntroduce` supplies the existing dice button and behavior.

**Tech Stack:** React 19, Tailwind CSS 4, Node.js built-in test runner

## Global Constraints

- Preserve all existing `InlineInput` behavior when no adornment is supplied.
- Preserve nickname generation behavior and its accessible label.
- Keep input text clear of the dice button.
- Do not create a duplicate nickname input component or add dependencies.

---

### Task 1: Optional Inline Input Adornment

**Files:**
- Create: `src/pages/UserDetails/components/inlineInputAdornment.test.js`
- Modify: `src/pages/UserDetails/components/InlineInput.jsx`
- Modify: `src/pages/Surveys/SurveyIntroduce.jsx`

**Interfaces:**
- Consumes: Optional `endAdornment` React node on `InlineInput`.
- Produces: A right-aligned adornment inside the input area and conditional `pr-12` input spacing.

- [ ] **Step 1: Write the failing source contract test**

Read both component files and assert:

```js
assert.match(inlineInputSource, /endAdornment/);
assert.match(inlineInputSource, /endAdornment \? "pr-12" : ""/);
assert.match(inlineInputSource, /absolute inset-y-0 right-1 flex items-center/);
assert.match(surveySource, /endAdornment=\{/);
assert.match(surveySource, /aria-label="무작위 닉네임 생성"/);
assert.doesNotMatch(surveySource, /flex items-end gap-2/);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test src/pages/UserDetails/components/inlineInputAdornment.test.js`

Expected: FAIL because `InlineInput` has no `endAdornment` support.

- [ ] **Step 3: Implement optional adornment support**

Add `endAdornment` to `InlineInput` props. Wrap the input in a `relative mt-2` element, move `mt-2` off the input, add conditional `pr-12`, and render:

```jsx
{endAdornment && (
    <div className="absolute inset-y-0 right-1 flex items-center">
        {endAdornment}
    </div>
)}
```

- [ ] **Step 4: Move the dice into the nickname input**

Remove the separate flex row and width-limited wrapper in `SurveyIntroduce`. Pass the existing dice button through:

```jsx
endAdornment={(
    <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-transparent text-xl transition-colors hover:bg-ui-sub focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
        aria-label="무작위 닉네임 생성"
        onClick={() => setNickname(generateRandomNickname())}
    >
        🎲
    </button>
)}
```

- [ ] **Step 5: Run focused and complete verification**

Run: `node --test src/pages/UserDetails/components/inlineInputAdornment.test.js`

Expected: PASS.

Run: `node --test src/**/*.test.js`

Expected: All tests pass.

Run: `npm.cmd run lint`

Expected: ESLint exits successfully.

Run: `npm.cmd run build`

Expected: Vite production build exits successfully.

- [ ] **Step 6: Commit**

```bash
git add src/pages/UserDetails/components/inlineInputAdornment.test.js src/pages/UserDetails/components/InlineInput.jsx src/pages/Surveys/SurveyIntroduce.jsx docs/superpowers/plans/2026-07-24-inline-nickname-dice.md
git commit -m "feat: embed nickname dice in input"
```
