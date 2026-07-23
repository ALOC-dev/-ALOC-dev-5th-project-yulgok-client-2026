# 공통 모달 AI 친화적 주석 설계

## 목적

다른 개발자나 AI 에이전트가 내부 구현을 분석하지 않고도 공통 모달의 공개 API, 올바른 조합 방식, 닫기 규칙과 제약을 이해할 수 있게 한다.

## 변경 범위

- `src/components/Modal/index.js`: 공개 import 방식과 최소 사용 예시
- `src/components/Modal/Modal.jsx`: controlled 상태, props, 닫기 reason, Footer 직접 자식 제약
- `src/components/Modal/ModalFooter.jsx`: 스크롤 본문과 분리되는 전용 Footer의 역할
- `src/components/Modal/ModalButton.jsx`: 지원 variant와 자동 닫힘이 없다는 규칙

## 주석 원칙

- JSDoc 형식을 사용해 AI 도구가 컴포넌트 바로 위에서 문맥을 읽을 수 있게 한다.
- 코드에서 자명한 내부 동작을 줄마다 설명하지 않는다.
- 사용자가 반드시 알아야 하는 공개 계약과 잘못 사용하기 쉬운 제약을 우선한다.
- 실제로 동작하는 compound API 예시를 포함한다.
- `Modal.Footer`는 `Modal`의 직접 자식이어야 한다고 명시한다.
- `open` 상태는 부모가 관리하고 Footer 버튼은 자동으로 모달을 닫지 않는다고 명시한다.
- `onClose`의 reason은 `overlay`, `escape`, `close-button`이라고 명시한다.
- Button variant는 `primary`, `secondary`, `danger`라고 명시한다.

## 검증

- 주석의 예시 import와 API 이름이 실제 export와 일치한다.
- 주석이 현재 동작과 모순되지 않는다.
- ESLint와 Vite 프로덕션 빌드가 통과한다.
