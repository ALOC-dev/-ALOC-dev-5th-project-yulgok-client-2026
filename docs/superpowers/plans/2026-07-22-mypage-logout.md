# MyPage Logout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a MyPage logout button that requests backend logout and always expires the client authentication state.

**Architecture:** `AuthContext.logout()` is the single owner of logout behavior. It posts to `/api/auth/logout` with credentials and clears local authentication in a `finally` block; MyPage only manages the button's pending state and delegates to the context.

**Tech Stack:** React 19, React Router 7, Axios, Vite 8, Vitest, jsdom, React Testing Library

## Global Constraints

- Use `POST /api/auth/logout`.
- Send browser credentials so the backend can invalidate its refresh-token cookie.
- Clear the access token and expire the React authentication state even if the backend request fails.
- Keep backend logout errors observable to the MyPage caller.
- Do not refactor unrelated authentication or page code.

---

### Task 1: AuthContext logout workflow

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/auth/AuthContext.jsx`
- Create: `src/auth/AuthContext.test.jsx`

**Interfaces:**
- Consumes: `apiClient.post(url, data, config)` and `removeAccessToken()`.
- Produces: asynchronous `logout(): Promise<void>` exposed by `useAuth()`; it rejects on a backend failure only after local cleanup.

- [ ] **Step 1: Install the test dependencies and add the test script**

Run:

```powershell
npm install --save-dev vitest jsdom @testing-library/react
```

Add to `package.json` scripts:

```json
"test": "vitest run"
```

- [ ] **Step 2: Write failing AuthContext tests**

Create `src/auth/AuthContext.test.jsx` with a small consumer rendered inside `AuthProvider`. Mock only the Axios boundary and token-storage boundary. Assert that clicking its logout trigger:

```jsx
expect(apiClient.post).toHaveBeenCalledWith(
  '/api/auth/logout',
  undefined,
  { withCredentials: true },
);
expect(removeAccessToken).toHaveBeenCalledOnce();
expect(screen.getByTestId('authenticated').textContent).toBe('false');
```

Add a second test where `apiClient.post` rejects and assert that `removeAccessToken` still runs and the rendered authentication value becomes `false`.

- [ ] **Step 3: Run the focused test and verify RED**

Run:

```powershell
npm test -- src/auth/AuthContext.test.jsx
```

Expected: FAIL because the existing synchronous `logout()` neither calls `/api/auth/logout` nor returns its rejection.

- [ ] **Step 4: Implement the minimal asynchronous logout**

Replace `logout()` in `src/auth/AuthContext.jsx` with:

```jsx
async function logout() {
  try {
    await apiClient.post('/api/auth/logout', undefined, {
      withCredentials: true,
    });
  } finally {
    removeAccessToken();
    setIsAuthenticated(false);
    setIsCheckingAuth(false);
  }
}
```

- [ ] **Step 5: Run the focused test and verify GREEN**

Run:

```powershell
npm test -- src/auth/AuthContext.test.jsx
```

Expected: both successful and failed backend logout cases PASS.

- [ ] **Step 6: Commit Task 1**

```powershell
git add package.json package-lock.json src/auth/AuthContext.jsx src/auth/AuthContext.test.jsx
git commit -m "feat: 백엔드 로그아웃과 인증 만료 연동"
```

### Task 2: MyPage logout button

**Files:**
- Modify: `src/pages/MyPage/MyPage.jsx`
- Create: `src/pages/MyPage/MyPage.test.jsx`

**Interfaces:**
- Consumes: `useAuth().logout(): Promise<void>`.
- Produces: a `로그아웃` button that is disabled and displays `로그아웃 중...` while the request is pending.

- [ ] **Step 1: Write the failing MyPage test**

Mock `useAuth()` to return a controllable pending `logout` promise. Render `MyPage`, click `로그아웃`, and assert:

```jsx
expect(logout).toHaveBeenCalledOnce();
expect(screen.getByRole('button', { name: '로그아웃 중...' }).disabled).toBe(true);
```

Reject the promise and verify the rejection is handled by the component rather than becoming unhandled.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
npm test -- src/pages/MyPage/MyPage.test.jsx
```

Expected: FAIL because MyPage currently renders no button and does not consume `useAuth()`.

- [ ] **Step 3: Implement the minimal MyPage UI**

Implement `MyPage` with local `isLoggingOut` state and this handler:

```jsx
async function handleLogout() {
  if (isLoggingOut) return;

  setIsLoggingOut(true);
  try {
    await logout();
  } catch (error) {
    console.error('로그아웃 요청 실패', error);
  } finally {
    setIsLoggingOut(false);
  }
}
```

Render a `type="button"` button using the existing brand Tailwind classes, with `disabled={isLoggingOut}` and the label switching between `로그아웃` and `로그아웃 중...`.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```powershell
npm test -- src/pages/MyPage/MyPage.test.jsx
```

Expected: PASS with one logout call and a disabled pending button.

- [ ] **Step 5: Run full verification**

Run:

```powershell
npm test
npm run lint
npm run build
```

Expected: all tests pass, ESLint exits with code 0, and Vite creates a production build without errors.

- [ ] **Step 6: Commit Task 2**

```powershell
git add src/pages/MyPage/MyPage.jsx src/pages/MyPage/MyPage.test.jsx
git commit -m "feat: MyPage 테스트 로그아웃 버튼 추가"
```
