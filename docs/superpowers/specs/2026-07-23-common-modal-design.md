# 공통 범용형 모달 설계

## 목적

기숙사 합격 화면 예시 이미지, 도움말, 확인 메시지 등 다양한 콘텐츠를 일관된 UI와 접근성 동작으로 표시하는 공통 모달을 제공한다. 각 사용 화면은 콘텐츠와 액션만 결정하고, 오버레이·포커스·스크롤·닫기 동작은 공통 컴포넌트가 담당한다.

## 범위

- 자유로운 본문 콘텐츠
- 선택적인 제목과 설명
- 닫기, 확인, 취소, 위험 액션 버튼 조합
- 배경 클릭, Esc 키, 우측 상단 닫기 버튼
- 모바일 우선 반응형 레이아웃
- 키보드 및 스크린 리더 접근성

기존 `PrivacyConsentModal`과 채팅 화면의 개별 모달을 이번 작업에서 마이그레이션하지 않는다. 공통 모달이 안정화된 뒤 별도 작업으로 전환할 수 있다.

## 컴포넌트 구조

```text
src/components/Modal/
├── Modal.jsx
├── ModalFooter.jsx
├── ModalButton.jsx
└── index.js
```

- `Modal`: Portal, 오버레이, 헤더, 본문, 닫기 동작, 스크롤 잠금과 포커스 관리를 담당한다.
- `Modal.Footer`: 액션 버튼 영역의 정렬과 간격을 담당한다.
- `Modal.Button`: `primary`, `secondary`, `danger` 스타일을 제공한다.
- `index.js`: 외부에 `Modal` API만 노출한다.

`Modal.Footer`와 `Modal.Button`은 `Modal.Footer`, `Modal.Button` 형태의 합성 API로 연결한다. 헤더는 일관성을 위해 별도 합성 컴포넌트로 노출하지 않고 `title`과 `description`으로 구성한다.

## 공개 API

```jsx
<Modal
  open={isOpen}
  onClose={handleClose}
  title="기숙사 합격 화면 예시"
  description="아래와 같은 화면을 캡처해 주세요."
  size="large"
  closeOnOverlayClick
  closeOnEscape
  showCloseButton
  initialFocusRef={confirmButtonRef}
>
  <img
    src={dormitoryExample}
    alt="기숙사 합격 결과 화면 예시"
    className="h-auto w-full rounded-xl object-contain"
  />

  <Modal.Footer>
    <Modal.Button variant="secondary" onClick={handleClose}>
      닫기
    </Modal.Button>
    <Modal.Button ref={confirmButtonRef} onClick={handleConfirm}>
      확인
    </Modal.Button>
  </Modal.Footer>
</Modal>
```

### Modal props

| prop | 형식 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `open` | boolean | 필수 | 모달 표시 여부 |
| `onClose` | function | 필수 | 닫기 요청을 부모에 전달 |
| `title` | ReactNode | 없음 | 모달 제목 |
| `description` | ReactNode | 없음 | 제목 아래의 보조 설명 |
| `children` | ReactNode | 없음 | 자유로운 본문 및 Footer |
| `size` | `small \| medium \| large \| full` | `medium` | 컨테이너 최대 너비 |
| `closeOnOverlayClick` | boolean | `true` | 오버레이 클릭 닫기 허용 |
| `closeOnEscape` | boolean | `true` | Esc 키 닫기 허용 |
| `showCloseButton` | boolean | `true` | 우측 상단 X 버튼 표시 |
| `initialFocusRef` | RefObject | 없음 | 열릴 때 우선 포커스할 요소 |

`onClose`는 `{ reason }` 객체를 받는다. 공통 컴포넌트가 생성하는 reason은 `overlay`, `escape`, `close-button`이다. Footer 버튼에서 닫을 때에는 해당 버튼의 이벤트 처리기가 필요한 작업을 수행하고 부모 상태를 변경한다.

확인 버튼은 클릭만으로 자동 닫히지 않는다. 비동기 작업의 성공 여부에 따라 부모가 닫기를 결정하며, 실패하면 모달을 유지해 오류 메시지나 재시도 UI를 표시할 수 있다.

## 상호작용과 접근성

- 열린 모달은 `createPortal`을 이용해 `document.body` 아래에 렌더링한다.
- 컨테이너에 `role="dialog"`와 `aria-modal="true"`를 적용한다.
- React `useId`로 제목과 설명을 `aria-labelledby`, `aria-describedby`에 연결한다.
- 모달이 열리기 직전의 포커스 요소를 기억하고 닫힐 때 복원한다.
- 열릴 때 `initialFocusRef`가 있으면 해당 요소, 없으면 모달 내부의 첫 포커스 가능 요소, 둘 다 없으면 다이얼로그 컨테이너에 포커스한다.
- Tab과 Shift+Tab 순환을 처리해 포커스가 모달 밖으로 나가지 않도록 한다.
- 모달이 열려 있는 동안 body 스크롤을 잠그고 닫히거나 unmount될 때 기존 값을 복원한다.
- 오버레이는 `event.target === event.currentTarget`인 경우에만 닫기 요청을 발생시킨다.
- `closeOnOverlayClick` 또는 `closeOnEscape`가 `false`이면 해당 입력을 무시한다.
- 중첩 모달은 초기 범위에서 지원하지 않는다.

## 레이아웃과 스타일

현재 프로젝트의 Tailwind CSS와 `src/index.css` 디자인 토큰을 사용한다.

- 오버레이: 전체 viewport 고정, 반투명 검정 배경, 최상위 z-index
- 다이얼로그: 흰색 배경, 둥근 모서리, 그림자, 최대 높이 `90dvh`
- 본문: 최대 높이를 넘으면 모달 내부에서 세로 스크롤
- Footer: 콘텐츠와 구분되며 버튼 한 개는 전체 너비, 두 개 이상은 가용 공간을 균등 사용
- `small`: 간단한 확인이나 경고
- `medium`: 일반 도움말의 기본 크기
- `large`: 예시 이미지 등 넓은 콘텐츠
- `full`: 모바일 화면 대부분을 사용하는 복잡한 콘텐츠
- Button `primary`: 주요 확인 액션
- Button `secondary`: 닫기와 취소
- Button `danger`: 삭제 등 위험 액션

오픈 애니메이션은 짧은 opacity와 scale 전환을 사용한다. `prefers-reduced-motion: reduce` 환경에서는 애니메이션을 제거한다. 모바일 safe area를 고려해 오버레이 패딩과 Footer 하단 여백을 확보한다.

## 상태 및 오류 처리

모달은 표시 여부를 내부 상태로 소유하지 않는 controlled component다. 부모가 `open`과 `onClose`를 통해 상태의 단일 출처를 유지한다.

저장 중이거나 반드시 명시적인 응답이 필요한 모달은 다음과 같이 외부 닫기를 막는다.

```jsx
<Modal
  open={isSaving}
  onClose={handleClose}
  closeOnOverlayClick={false}
  closeOnEscape={false}
/>
```

비동기 확인 작업은 부모가 로딩, 성공, 실패 상태를 관리한다. 로딩 중에는 액션 버튼을 disabled 처리하고 필요하면 닫기 옵션도 비활성화한다. 공통 모달은 업무별 오류 문구를 해석하거나 표시하지 않는다.

## 검증

현재 프로젝트에는 테스트 러너가 없으므로 최초 구현은 다음 기준으로 검증한다.

- ESLint 통과
- 프로덕션 빌드 통과
- `open=false`일 때 Portal이 렌더링되지 않음
- 배경, Esc, X 버튼이 올바른 reason으로 `onClose`를 호출함
- 모달 내부 클릭은 닫기를 유발하지 않음
- 비활성화한 닫기 방식은 동작하지 않음
- 열고 닫을 때 body 스크롤과 이전 포커스가 복원됨
- Tab과 Shift+Tab 포커스 순환이 동작함
- 제목과 설명의 ARIA 연결이 유효함
- 각 size 및 버튼 variant가 모바일과 데스크톱에서 올바르게 표시됨
- 긴 도움말과 큰 이미지가 viewport를 벗어나지 않고 내부 스크롤됨

자동화된 컴포넌트 테스트 도입은 별도 작업으로 다룬다.
