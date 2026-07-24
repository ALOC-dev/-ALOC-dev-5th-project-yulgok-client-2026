# ADMIN UserDetails PATCH Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make ADMIN UserDetails submissions use `PATCH /api/users/details`.

**Architecture:** Extend the existing pure role-to-submitter selector so ADMIN
shares USER's PATCH path. Keep the component flow and API functions unchanged.

**Tech Stack:** JavaScript ES modules, React 19, Node built-in test runner

## Global Constraints

- `GUEST` continues to use `POST /api/users/details`.
- `USER` and `ADMIN` use `PATCH /api/users/details`.
- Missing and unknown roles continue to throw.
- ADMIN does not fall back to POST when PATCH fails.

---

### Task 1: Extend the UserDetails submitter selector

**Files:**
- Modify: `src/pages/UserDetails/userDetailsSubmit.test.js`
- Modify: `src/pages/UserDetails/userDetailsSubmit.js`

**Interfaces:**
- Consumes: `getUserDetailsSubmitter(role, { postUserDetails, patchUserDetails })`
- Produces: the existing submitter function with ADMIN mapped to `patchUserDetails`

- [ ] **Step 1: Write the failing ADMIN selector test**

Add the ADMIN assertion to the existing role-selection test:

```js
test('selects POST for GUEST and PATCH for USER and ADMIN', () => {
  assert.equal(getUserDetailsSubmitter('GUEST', submitters), postUserDetails);
  assert.equal(getUserDetailsSubmitter('USER', submitters), patchUserDetails);
  assert.equal(getUserDetailsSubmitter('ADMIN', submitters), patchUserDetails);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
node --test src/pages/UserDetails/userDetailsSubmit.test.js
```

Expected: FAIL because `getUserDetailsSubmitter('ADMIN', ...)` throws
`Unsupported user role: ADMIN`.

- [ ] **Step 3: Implement the minimal selector change**

Update the PATCH branch:

```js
if (role === 'USER' || role === 'ADMIN') return patchUserDetails;
```

- [ ] **Step 4: Run focused and related tests**

Run:

```bash
node --test src/pages/UserDetails/userDetailsSubmit.test.js src/pages/UserDetails/userDetailsValidation.test.js src/pages/UserDetails/userDetailsFieldValidation.test.js
```

Expected: 10 tests pass with zero failures.

- [ ] **Step 5: Run project verification**

Run:

```bash
npm run build
```

Expected: Vite production build completes successfully.

- [ ] **Step 6: Commit the implementation**

```bash
git add src/pages/UserDetails/userDetailsSubmit.js src/pages/UserDetails/userDetailsSubmit.test.js
git commit -m "fix: allow admin user details updates"
```
