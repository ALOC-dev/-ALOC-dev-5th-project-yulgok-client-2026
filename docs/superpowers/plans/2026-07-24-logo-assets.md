# Logo Assets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 새 서비스 로고와 플랫폼별 아이콘을 로그인 화면, 브라우저 메타데이터, 설치형 웹 앱에 용도별로 적용하고 삭제된 파비콘 의존성을 제거한다.

**Architecture:** `public` 정적 자산은 Vite 루트 절대 경로로 소비한다. 로그인은 서비스 로고를 직접 렌더링하고, 브라우저 및 설치형 앱 아이콘은 `index.html`과 `manifest.webmanifest`가 해상도별 자산을 선언한다. 채팅 프로필 fallback은 브랜드 로고 대신 재사용 가능한 중립 아바타 컴포넌트로 통일한다.

**Tech Stack:** React 19, Vite 7, Tailwind CSS 4, Node.js test runner

## Global Constraints

- `uos_logo.svg`는 로그인 배경 워터마크로 유지한다.
- `logo.svg`는 원본 비율을 유지하고 의미 있는 대체 텍스트를 제공한다.
- `/favicon.svg`와 `/icons.svg` 참조를 남기지 않는다.
- 새 런타임 의존성을 추가하지 않는다.

---

### Task 1: 정적 브랜드 자산과 웹 앱 메타데이터

**Files:**
- Create: `public/logo.svg`
- Create: `public/favicon.ico`
- Create: `public/favicon-16.png`
- Create: `public/favicon-32.png`
- Create: `public/apple-touch-icon.png`
- Create: `public/icon-192.png`
- Create: `public/icon-512.png`
- Create: `public/manifest.webmanifest`
- Modify: `index.html`
- Test: `src/brandAssets.test.js`

**Interfaces:**
- Consumes: `public` 루트 절대 URL
- Produces: `/logo.svg`, 해상도별 favicon 링크, `/manifest.webmanifest`

- [ ] **Step 1: 정적 선언을 검사하는 실패 테스트 작성**

```js
test('declares purpose-built brand assets', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /href="\/favicon\.ico"/);
  assert.match(html, /sizes="16x16"[^>]+href="\/favicon-16\.png"/);
  assert.match(html, /sizes="32x32"[^>]+href="\/favicon-32\.png"/);
  assert.match(html, /href="\/apple-touch-icon\.png"/);
  assert.match(html, /href="\/manifest\.webmanifest"/);
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm test -- --run src/brandAssets.test.js`
Expected: 기존 `/favicon.svg` 선언 때문에 FAIL

- [ ] **Step 3: 자산 복사와 메타데이터 구현**

`index.html`에 ICO, 16px/32px PNG, Apple touch icon, manifest 링크를 선언한다. `manifest.webmanifest`에는 `icon-192.png`와 `icon-512.png`를 각각 `192x192`, `512x512`, `image/png`으로 선언한다.

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm test -- --run src/brandAssets.test.js`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add public index.html src/brandAssets.test.js
git commit -m "feat: register service logo assets"
```

### Task 2: 로그인 서비스 로고

**Files:**
- Modify: `src/pages/Login/Login.jsx`
- Test: `src/brandAssets.test.js`

**Interfaces:**
- Consumes: `/logo.svg`, `/uos_logo.svg`
- Produces: 접근 가능한 서비스 로고와 장식용 학교 워터마크

- [ ] **Step 1: 로그인 마크업 실패 테스트 추가**

```js
assert.match(login, /src="\/logo\.svg"/);
assert.match(login, /alt="율곡"/);
assert.match(login, /h-10 w-auto/);
assert.match(login, /src="\/uos_logo\.svg"/);
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm test -- --run src/brandAssets.test.js`
Expected: 비어 있는 `src` 때문에 FAIL

- [ ] **Step 3: 최소 로그인 마크업 구현**

비어 있는 이미지와 임시 텍스트를 `<img src="/logo.svg" alt="율곡" className="h-10 w-auto" />`로 교체하고 학교 워터마크는 유지한다.

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm test -- --run src/brandAssets.test.js`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add src/pages/Login/Login.jsx src/brandAssets.test.js
git commit -m "feat: show service logo on login"
```

### Task 3: 중립 프로필 fallback

**Files:**
- Create: `src/pages/Chat/components/ProfileAvatar.jsx`
- Modify: `src/pages/Chat/components/ChatListItem.jsx`
- Modify: `src/pages/Chat/components/ChatRoomHeader.jsx`
- Modify: `src/pages/Chat/components/MessageItem.jsx`
- Test: `src/brandAssets.test.js`

**Interfaces:**
- Consumes: `imageUrl?: string`, `alt: string`, `className?: string`
- Produces: `ProfileAvatar` 컴포넌트. 이미지 부재 또는 로드 오류 시 `aria-hidden`인 중립 사용자 실루엣을 렌더링한다.

- [ ] **Step 1: 삭제된 favicon 의존성 실패 테스트 추가**

```js
for (const source of chatSources) {
  assert.doesNotMatch(source, /\/favicon\.svg/);
}
assert.match(profileAvatar, /function ProfileAvatar/);
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm test -- --run src/brandAssets.test.js`
Expected: 세 컴포넌트의 `/favicon.svg` 참조 때문에 FAIL

- [ ] **Step 3: 중립 아바타 구현**

`ProfileAvatar`는 `useState`로 이미지 오류를 기록하고, 유효한 이미지가 없으면 동일한 크기의 원형 컨테이너 안에 inline SVG 사용자 실루엣을 표시한다. 세 채팅 컴포넌트는 직접 `<img>` 대신 이 컴포넌트를 사용한다.

- [ ] **Step 4: 테스트와 전체 검증**

Run: `npm test`
Expected: 모든 테스트 PASS

Run: `npm run build`
Expected: 프로덕션 빌드 성공

Run: `rg -n "/favicon\.svg|/icons\.svg" index.html src public`
Expected: 결과 없음

- [ ] **Step 5: 커밋**

```bash
git add src/pages/Chat/components src/brandAssets.test.js
git commit -m "fix: use neutral chat profile fallback"
```
