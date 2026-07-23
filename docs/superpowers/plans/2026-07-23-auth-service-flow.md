# Auth Status Service Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Route users to the correct onboarding, survey, certification, admin, or matching page from `/api/auth/status` after login and on re-entry.

**Architecture:** A pure `serviceFlow.js` module owns all state precedence and certified-access rules. A protected `ServiceEntry` component owns entry redirects and GUEST consent, while pages that mutate progress refresh AuthContext immediately after successful API calls.

**Tech Stack:** React 19, React Router 7, Node built-in test runner, ESLint, Vite

## Global Constraints

- `certificationStatus` must only be evaluated after confirming `role === 'USER'` and `surveyCompleted === true`.
- `role === 'USER' && status === 'ACTIVE'` always routes to `/matching`.
- `certificationStatus === 'APPROVED'` also grants certified access.
- GUEST users see privacy consent and Onboarding on every re-entry before basic details are complete.
- Do not add a global progress guard; direct access to onboarding and survey pages stays available for testing.
- Remove localStorage as the durable source for certification request status.
- Preserve unrelated worktree changes.

---

### Task 1: Pure service-flow policy

**Files:**
- Create: `src/auth/serviceFlow.js`
- Create: `src/auth/serviceFlow.test.js`

**Interfaces:**
- Produces: `SERVICE_STAGES`
- Produces: `getServiceStage(user)`
- Produces: `getServiceDestination(user)`
- Produces: `canAccessCertifiedRoutes(user)`

- [ ] **Step 1: Write the failing policy tests**

Create `src/auth/serviceFlow.test.js` with table-driven tests covering:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SERVICE_STAGES,
  canAccessCertifiedRoutes,
  getServiceDestination,
  getServiceStage,
} from './serviceFlow.js';

const cases = [
  ['missing user', null, SERVICE_STAGES.LOGIN, '/login'],
  ['admin', { role: 'ADMIN' }, SERVICE_STAGES.ADMIN, '/admin'],
  ['guest', { role: 'GUEST', status: 'PENDING', surveyCompleted: false }, SERVICE_STAGES.CONSENT, '/entry'],
  ['survey incomplete', { role: 'USER', status: 'PENDING', surveyCompleted: false }, SERVICE_STAGES.SURVEY, '/surveys/sleep'],
  ['survey incomplete ignores certification', { role: 'USER', status: 'PENDING', surveyCompleted: false, certificationStatus: 'APPROVED' }, SERVICE_STAGES.SURVEY, '/surveys/sleep'],
  ['certification not requested', { role: 'USER', status: 'PENDING', surveyCompleted: true }, SERVICE_STAGES.CERTIFICATION, '/certification'],
  ['certification requested', { role: 'USER', status: 'PENDING', surveyCompleted: true, certificationStatus: 'REQUESTED' }, SERVICE_STAGES.CERTIFICATION, '/certification'],
  ['certification rejected', { role: 'USER', status: 'PENDING', surveyCompleted: true, certificationStatus: 'REJECTED' }, SERVICE_STAGES.CERTIFICATION, '/certification'],
  ['certification approved', { role: 'USER', status: 'PENDING', surveyCompleted: true, certificationStatus: 'APPROVED' }, SERVICE_STAGES.CERTIFIED, '/matching'],
  ['active user', { role: 'USER', status: 'ACTIVE', surveyCompleted: false }, SERVICE_STAGES.CERTIFIED, '/matching'],
  ['unknown role', { role: 'UNKNOWN' }, SERVICE_STAGES.LOGIN, '/login'],
];

for (const [name, user, stage, destination] of cases) {
  test(name, () => {
    assert.equal(getServiceStage(user), stage);
    assert.equal(getServiceDestination(user), destination);
  });
}

test('only ACTIVE or APPROVED users access certified routes', () => {
  assert.equal(canAccessCertifiedRoutes({ role: 'USER', status: 'ACTIVE' }), true);
  assert.equal(canAccessCertifiedRoutes({
    role: 'USER',
    status: 'PENDING',
    surveyCompleted: true,
    certificationStatus: 'APPROVED',
  }), true);
  assert.equal(canAccessCertifiedRoutes({
    role: 'USER',
    status: 'PENDING',
    surveyCompleted: true,
    certificationStatus: 'REQUESTED',
  }), false);
});
```

- [ ] **Step 2: Verify the test fails**

Run:

```bash
node --test src/auth/serviceFlow.test.js
```

Expected: FAIL because `serviceFlow.js` does not exist.

- [ ] **Step 3: Implement the policy**

Create `src/auth/serviceFlow.js`:

```js
export const SERVICE_STAGES = Object.freeze({
  LOGIN: 'LOGIN',
  ADMIN: 'ADMIN',
  CONSENT: 'CONSENT',
  SURVEY: 'SURVEY',
  CERTIFICATION: 'CERTIFICATION',
  CERTIFIED: 'CERTIFIED',
});

const destinations = {
  [SERVICE_STAGES.LOGIN]: '/login',
  [SERVICE_STAGES.ADMIN]: '/admin',
  [SERVICE_STAGES.CONSENT]: '/entry',
  [SERVICE_STAGES.SURVEY]: '/surveys/sleep',
  [SERVICE_STAGES.CERTIFICATION]: '/certification',
  [SERVICE_STAGES.CERTIFIED]: '/matching',
};

export function getServiceStage(user) {
  if (user?.role === 'ADMIN') return SERVICE_STAGES.ADMIN;
  if (user?.role === 'USER' && user.status === 'ACTIVE') return SERVICE_STAGES.CERTIFIED;
  if (user?.role === 'GUEST') return SERVICE_STAGES.CONSENT;
  if (user?.role !== 'USER') return SERVICE_STAGES.LOGIN;
  if (user.surveyCompleted !== true) return SERVICE_STAGES.SURVEY;
  if (user.certificationStatus === 'APPROVED') return SERVICE_STAGES.CERTIFIED;
  return SERVICE_STAGES.CERTIFICATION;
}

export function getServiceDestination(user) {
  return destinations[getServiceStage(user)];
}

export function canAccessCertifiedRoutes(user) {
  return getServiceStage(user) === SERVICE_STAGES.CERTIFIED;
}
```

- [ ] **Step 4: Verify the policy tests pass**

Run `node --test src/auth/serviceFlow.test.js`.

Expected: 12 tests pass, 0 fail.

- [ ] **Step 5: Commit**

```bash
git add src/auth/serviceFlow.js src/auth/serviceFlow.test.js
git commit -m "feat: add auth service flow policy"
```

### Task 2: Shared entry page and login callback

**Files:**
- Create: `src/auth/ServiceEntry.jsx`
- Modify: `src/pages/Login/KakaoCallback.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `getServiceDestination`, `getServiceStage`, `SERVICE_STAGES`
- Consumes: `currentUser`, `refreshCurrentUser`, `login`, `logout` from AuthContext
- Produces: protected `/entry` route

- [ ] **Step 1: Implement `ServiceEntry`**

Create a component that:

- redirects missing users to `/login`
- renders `PrivacyConsentModal` only for `SERVICE_STAGES.CONSENT`
- stores the existing consent payload/version on agreement and moves to `/onboarding`
- logs out and moves to `/login` on decline
- uses `<Navigate replace>` for all other destinations

Use the existing `PRIVACY_CONSENT_KEY`, version `2026-07-22`, and the exact storage payload currently in `KakaoCallback`.

- [ ] **Step 2: Simplify KakaoCallback**

After token validation:

```js
login(accessToken);
await refreshCurrentUser();
navigate('/entry', { replace: true });
```

Remove consent state, PrivacyConsentModal, localStorage consent handling, ADMIN branching, and direct `getCurrentUser()` usage from the callback.

- [ ] **Step 3: Add the entry route**

In `src/App.jsx`:

```jsx
<Route element={<ProtectedRoute />}>
  <Route path="/" element={<Navigate to="/entry" replace />} />
  <Route path="/entry" element={<ServiceEntry />} />
  {/* existing protected routes */}
</Route>
```

Keep `/test` and all existing direct page routes.

- [ ] **Step 4: Verify**

Run:

```bash
npx.cmd eslint src/auth/ServiceEntry.jsx src/pages/Login/KakaoCallback.jsx src/App.jsx
npm.cmd run build
```

Expected: both exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/auth/ServiceEntry.jsx src/pages/Login/KakaoCallback.jsx src/App.jsx
git commit -m "feat: route login and reentry by auth status"
```

### Task 3: Refresh progress after profile and survey submission

**Files:**
- Modify: `src/pages/UserDetails/UserDetails.jsx`
- Modify: `src/pages/Surveys/SurveyIntroduce.jsx`

**Interfaces:**
- Consumes: `refreshCurrentUser()` from `useAuth()`

- [ ] **Step 1: Refresh after basic details**

Add `useAuth`, obtain `refreshCurrentUser`, and update the success path:

```js
await postUserDetails(requestBody);
await refreshCurrentUser();
navigate('/surveys/sleep');
```

- [ ] **Step 2: Refresh after survey submission**

Add `useAuth`, obtain `refreshCurrentUser`, and update the success path:

```js
await postSurveys(requestBody);
await refreshCurrentUser();
clearSurveyDraft();
navigate('/certification');
```

- [ ] **Step 3: Verify and commit**

Run focused ESLint and `npm.cmd run build`; expect exit 0.

```bash
git add src/pages/UserDetails/UserDetails.jsx src/pages/Surveys/SurveyIntroduce.jsx
git commit -m "feat: sync auth status after onboarding steps"
```

### Task 4: Certified route policy

**Files:**
- Modify: `src/auth/CertifiedRoute.jsx`

**Interfaces:**
- Consumes: `canAccessCertifiedRoutes(currentUser)` from `serviceFlow.js`

- [ ] **Step 1: Migrate CertifiedRoute**

Replace the old status-only call:

```jsx
if (!canAccessCertifiedRoutes(currentUser)) {
  return <Navigate to="/certification" replace state={{ from: location }} />;
}
```

- [ ] **Step 2: Verify and commit**

Run:

```bash
npx.cmd eslint src/auth/CertifiedRoute.jsx
node --test src/auth/serviceFlow.test.js
```

Expected: both commands pass.

```bash
git add src/auth/CertifiedRoute.jsx
git commit -m "refactor: align certified routes with auth status"
```

### Task 5: Server-driven certification actions

**Files:**
- Modify: `src/pages/Certification/Certification.jsx`
- Delete: `src/auth/certificationAccess.js`

**Interfaces:**
- Consumes: `canAccessCertifiedRoutes(user)` from `serviceFlow.js`
- Consumes: `currentUser`, `refreshCurrentUser` from AuthContext

- [ ] **Step 1: Remove durable local request state**

Delete `getRequestStorageKey`, `requestedStorageKey`, and all reads/writes/removals of `certification-requested:*`.

Add:

```js
const [requestedThisSession, setRequestedThisSession] = useState(false);
const certificationStatus = currentUser?.certificationStatus;
const isRequested = certificationStatus === 'REQUESTED' || requestedThisSession;
const isRejected = certificationStatus === 'REJECTED';
```

- [ ] **Step 2: Update automatic certified navigation**

Use:

```js
useEffect(() => {
  if (canAccessCertifiedRoutes(currentUser)) {
    navigate('/matching', { replace: true });
  }
}, [currentUser, navigate]);
```

- [ ] **Step 3: Implement status refresh and submission**

For `isRequested`, call `refreshCurrentUser()` and:

- navigate for certified access
- show rejection guidance for `REJECTED`
- otherwise show the review-in-progress message

For initial or rejected submission:

- require an image
- run `submitCertificationImage`
- set `requestedThisSession` true
- call `refreshCurrentUser`
- navigate if certified
- otherwise show the request-complete message

- [ ] **Step 4: Derive button state**

Use:

```js
const requiresImage = !isRequested;
const label = isWorking
  ? '확인 중...'
  : isRequested
    ? '인증 확인'
    : isRejected
      ? '다시 인증 요청하기'
      : '인증 요청 보내기';
```

Disable when working or when `requiresImage && !certificateImage`.

- [ ] **Step 5: Remove the old policy module**

After migrating Certification's import to `serviceFlow.js`, delete
`src/auth/certificationAccess.js`. Run:

```bash
rg "certificationAccess" src -n
```

Expected: no matches.

- [ ] **Step 6: Verify and commit**

Run focused ESLint, policy tests, and production build; expect all pass.

```bash
git add src/pages/Certification/Certification.jsx src/auth/certificationAccess.js
git commit -m "feat: drive certification flow from server status"
```

### Task 6: Final verification

**Files:**
- Verify all files changed in Tasks 1–5

- [ ] Run `node --test src/auth/serviceFlow.test.js`; expect all tests pass.
- [ ] Run `npm.cmd run lint`; expect exit code 0.
- [ ] Run `npm.cmd run build`; expect exit code 0.
- [ ] Run `rg "certification-requested|certificationAccess" src -n`; expect no matches.
- [ ] Run `git diff --check`; expect no whitespace errors.
- [ ] Manually verify login/re-entry for GUEST, survey incomplete, survey complete, REQUESTED, REJECTED, APPROVED, ACTIVE, and ADMIN fixtures.
