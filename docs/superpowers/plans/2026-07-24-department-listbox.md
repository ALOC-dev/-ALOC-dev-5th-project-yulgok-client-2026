# Department Listbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 학부·학과 항목을 한국어 오름차순으로 표시하는 프로젝트 스타일의 접근 가능한 커스텀 리스트박스를 구현한다.

**Architecture:** 순수 정렬 함수는 별도 모듈로 분리하고 `DropDownMenu`가 열림, 활성 항목, 선택, 외부 클릭과 키보드 상태를 관리한다. 기존 `items`, `value`, `onChange` 인터페이스는 유지한다.

**Tech Stack:** React 19, Tailwind CSS 4, Node test runner, ESLint, Vite

## Global Constraints

- 외부 UI 의존성을 추가하지 않는다.
- `items` 원본 배열을 변경하지 않는다.
- 기존 `onChange(value)` 인터페이스를 유지한다.

---

### Task 1: 한국어 정렬 유틸리티

**Files:**
- Create: `src/pages/UserDetails/components/sortKoreanItems.js`
- Create: `src/pages/UserDetails/components/sortKoreanItems.test.js`

**Interfaces:**
- Produces: `sortKoreanItems(items: string[]): string[]`

- [ ] 정렬 결과와 원본 불변성을 검증하는 실패 테스트를 작성한다.
- [ ] `node --test src/pages/UserDetails/components/sortKoreanItems.test.js`로 실패를 확인한다.
- [ ] `Intl.Collator('ko-KR', { sensitivity: 'base' })`를 사용하는 최소 구현을 작성한다.
- [ ] 같은 명령으로 통과를 확인한다.

### Task 2: 커스텀 리스트박스

**Files:**
- Modify: `src/pages/UserDetails/components/DropDownMenu.jsx`

**Interfaces:**
- Consumes: `sortKoreanItems(items)`
- Preserves: `DropDownMenu({ id, name, label, items, value, placeholder, required, disabled, onChange })`

- [ ] 네이티브 select를 combobox 트리거와 listbox/options 구조로 교체한다.
- [ ] 외부 클릭, Escape, 방향키, Enter, Space 및 선택 후 닫기를 구현한다.
- [ ] 기존 디자인 토큰으로 트리거, 메뉴, 활성·선택 항목, 화살표와 체크 표시를 스타일링한다.
- [ ] 숨은 input으로 폼 이름과 required 의미를 보존한다.

### Task 3: 검증

**Files:**
- Verify: `src/pages/UserDetails/components/DropDownMenu.jsx`
- Verify: `src/pages/UserDetails/components/sortKoreanItems.js`

- [ ] `node --test src/pages/UserDetails/components/sortKoreanItems.test.js`를 실행한다.
- [ ] `npm run lint`를 실행한다.
- [ ] `npm run build`를 실행한다.
