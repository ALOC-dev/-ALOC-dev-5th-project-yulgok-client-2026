# Loading Spinner Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace visible data-loading and asynchronous-action text with one accessible loading spinner while preserving errors, empty states, and business-status copy.

**Architecture:** A dependency-free `LoadingSpinner` component owns the spinner visual and screen-reader status label. Existing pages retain ownership of their loading booleans and layout containers; consumers only replace conditional text nodes with the shared component.

**Tech Stack:** React 19, React DOM server rendering for component tests, Tailwind CSS 4, Node test runner, ESLint, Vite.

## Global Constraints

- Do not change API calls, async state ownership, error handling, or navigation behavior.
- Keep error, empty-state, and persistent business-status messages visible.
- Every spinner must expose a task-specific accessible label.
- Add no external dependency.

---

### Task 1: Accessible shared spinner

**Files:**
- Create: `src/components/LoadingSpinner.js`
- Test: `src/components/LoadingSpinner.test.js`

**Interfaces:**
- Consumes: React `createElement`.
- Produces: `LoadingSpinner({ label, size = 'md', className = '' })`.

- [ ] **Step 1: Write the failing component test**

Test server-rendered markup for `role="status"`, `aria-live="polite"`, hidden label text, `aria-hidden="true"` on the visual ring, and the requested size class.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test src/components/LoadingSpinner.test.js`

Expected: FAIL because `LoadingSpinner.js` does not exist.

- [ ] **Step 3: Implement the minimal component**

Use `createElement` so the existing Node test runner can import the component without a JSX transform. Map `sm`, `md`, and `lg` to fixed Tailwind dimensions and render a border ring with `animate-spin motion-reduce:animate-none`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test src/components/LoadingSpinner.test.js`

Expected: PASS.

### Task 2: Page and section data loading

**Files:**
- Modify: `src/auth/ProtectedRoute.jsx`
- Modify: `src/pages/Chat/Chat.jsx`
- Modify: `src/pages/Chat/ChatRoom.jsx`
- Modify: `src/pages/Chat/components/MessageList.jsx`
- Modify: `src/pages/Matching/Matching.jsx`
- Modify: `src/pages/MyPage/MyPage.jsx`
- Modify: `src/pages/Surveys/SurveySleep.jsx`
- Modify: `src/pages/Admin/Admin.jsx`

**Interfaces:**
- Consumes: `LoadingSpinner`.
- Produces: unchanged page behavior with visual loading text replaced by spinners.

- [ ] **Step 1: Add imports and replace data-loading text**

Keep the existing loading containers and conditional branches. Render `LoadingSpinner` with a concrete label at each loading point.

- [ ] **Step 2: Verify data-loading copy removal**

Run an `rg` query for the exact former visible loading messages.

Expected: no matches in application source except accessible label props.

### Task 3: Async action loading

**Files:**
- Modify: `src/pages/Admin/Admin.jsx`
- Modify: `src/pages/Certification/Certification.jsx`
- Modify: `src/pages/Chat/ChatRoom.jsx`
- Modify: `src/pages/Chat/components/MessageList.jsx`
- Modify: `src/pages/MyPage/MyPage.jsx`
- Modify: `src/pages/Surveys/SurveyIntroduce.jsx`

**Interfaces:**
- Consumes: `LoadingSpinner` with `size="sm"`.
- Produces: disabled async-action controls whose visible pending content is a spinner and whose accessible name describes the pending task.

- [ ] **Step 1: Replace pending action labels**

Replace only labels driven by actual request-state booleans. Preserve ordinary labels and business-status copy.

- [ ] **Step 2: Preserve button geometry and accessible names**

Retain existing disabled behavior, add pending `aria-label` where required, and center the inline spinner without changing the control action.

### Task 4: Project verification

**Files:**
- Modify only files needed to correct verification failures caused by Tasks 1–3.

**Interfaces:**
- Consumes: all prior tasks.
- Produces: verified spinner integration.

- [ ] **Step 1: Run all Node tests**

Run: `node --test`

Expected: all tests pass.

- [ ] **Step 2: Run ESLint**

Run: `npm run lint`

Expected: exit 0.

- [ ] **Step 3: Run the production build**

Run: `npm run build`

Expected: exit 0.

- [ ] **Step 4: Inspect remaining loading copy and diff**

Search for visible loading phrases, confirm excluded business-state messages remain, run `git diff --check`, and inspect `git diff`.
