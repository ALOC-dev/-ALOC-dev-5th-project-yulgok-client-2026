# 인증 상태 기반 서비스 진입 흐름 설계

## 목적

`GET /api/auth/status` 응답의 `role`, `status`, `surveyCompleted`, `certificationStatus`를 기준으로 카카오 로그인 직후와 서비스 재접속 시 사용자의 진행 단계에 맞는 페이지로 이동한다. 상태 판정 로직을 한곳에 모아 로그인·재접속·인증 라우트에서 동일한 규칙을 사용한다.

## 상태 판정 우선순위

상태는 반드시 다음 순서로 판정한다.

1. `role === 'ADMIN'`이면 Admin 단계
2. `role === 'USER' && status === 'ACTIVE'`이면 인증 완료 단계
3. `role === 'GUEST'`이면 기본정보 입력 전 단계
4. `role === 'USER' && surveyCompleted !== true`이면 설문 단계
5. `role === 'USER' && surveyCompleted === true && certificationStatus === 'APPROVED'`이면 인증 완료 단계
6. `role === 'USER' && surveyCompleted === true`인 나머지 상태는 기숙사 인증 단계
7. 사용자 객체가 없거나 role이 알려지지 않았으면 로그인 단계

`certificationStatus`는 기숙사 인증 요청을 보낸 뒤에만 응답에 포함될 수 있다. 따라서 이 필드를 독립적으로 판정하지 않고, 반드시 `role === 'USER'`와 `surveyCompleted === true`까지 확인한 뒤 사용한다.

## 상태별 목적지

| 상태 | 단계 | 목적지 |
| --- | --- | --- |
| `role: ADMIN` | Admin | `/admin` |
| `role: GUEST` | 기본정보 입력 전 | 진입 페이지에서 동의 모달 |
| `role: USER`, `status: PENDING`, `surveyCompleted: false` | 설문 | `/surveys/sleep` |
| `role: USER`, `status: PENDING`, `surveyCompleted: true`, 인증 필드 없음 | 인증 요청 전 | `/certification` |
| 위 상태에서 `certificationStatus: REQUESTED` | 인증 검토 중 | `/certification` |
| 위 상태에서 `certificationStatus: REJECTED` | 인증 재요청 필요 | `/certification` |
| 위 상태에서 `certificationStatus: APPROVED` | 인증 완료 | `/matching` |
| `role: USER`, `status: ACTIVE` | 인증 완료 | `/matching` |

`status === 'ACTIVE'`는 인증 완료의 최우선 일반 사용자 기준이다. `certificationStatus === 'APPROVED'`도 백엔드 상태 반영 시차에 대비한 인증 완료 기준으로 유지한다.

## 모듈 구조

### `src/auth/serviceFlow.js`

외부 상태나 React에 의존하지 않는 순수 판정 모듈이다.

- `SERVICE_STAGES`: `LOGIN`, `ADMIN`, `CONSENT`, `SURVEY`, `CERTIFICATION`, `CERTIFIED`
- `getServiceStage(user)`: 사용자 응답을 단계로 변환
- `getServiceDestination(user)`: 단계에 해당하는 기본 경로 반환
- `canAccessCertifiedRoutes(user)`: Matching, Chat, MyPage 접근 가능 여부 반환

### `src/auth/ServiceEntry.jsx`

로그인 직후와 재접속 시 공통으로 사용하는 진입 컴포넌트다.

- AuthContext의 인증 확인 완료를 기다린다.
- 인증되지 않았거나 사용자 객체가 없으면 `/login`으로 이동한다.
- ADMIN은 `/admin`으로 이동한다.
- GUEST는 `PrivacyConsentModal`을 표시한다.
- GUEST가 동의하면 동의 정보를 localStorage에 저장하고 `/onboarding`으로 이동한다.
- GUEST가 거부하면 로그아웃한 뒤 `/login`으로 이동한다.
- 그 밖의 사용자는 판정된 경로로 replace 이동한다.

GUEST는 최초 로그인뿐 아니라 기본정보 입력 전 재접속 시에도 개인정보 동의 모달과 Onboarding을 다시 거친다. 기본정보 입력을 완료해 role이 USER가 되면 두 단계를 건너뛴다.

### `src/pages/Login/KakaoCallback.jsx`

카카오 콜백은 토큰 발급과 인증 상태 갱신만 담당한다.

1. 액세스 토큰 저장
2. `refreshCurrentUser()` 호출
3. `/entry`로 replace 이동

개인정보 동의와 사용자 상태별 분기는 `ServiceEntry`로 이동한다.

## 라우팅

- 공개 콜백 라우트는 기존대로 유지한다.
- `/entry`는 `ProtectedRoute` 아래에 둔다.
- `/`는 `/entry`로 replace 이동한다.
- 테스트 편의를 위해 `/user/details`, `/surveys/*`, `/certification` 직접 접근은 이번 작업에서 막지 않는다.
- Matching, Chat, MyPage는 기존 `CertifiedRoute`로 보호한다.
- 전역 단계 가드는 추후 `getServiceStage`를 재사용해 추가할 수 있다.

## 상태 동기화

서버 상태를 바꾸는 작업이 성공한 직후 AuthContext를 갱신한다.

- 카카오 토큰 발급 후
- 기본정보 제출 후
- 설문 제출 후
- 기숙사 인증 요청·재요청 후
- 인증 확인 버튼 클릭 시

`refreshCurrentUser()`가 반환하는 객체를 바로 다음 동작의 판정에도 사용해 React 상태 반영 시점에 의존하지 않는다.

## Certification 페이지

서버의 `certificationStatus`를 단일 상태 출처로 사용한다. 기존 `certification-requested:*` localStorage 판정은 제거한다.

| 상태 | 버튼 | 이미지 | 동작 |
| --- | --- | --- | --- |
| 필드 없음 | 인증 요청 보내기 | 필요 | 업로드 및 인증 요청 |
| `REQUESTED` | 인증 확인 | 불필요 | 서버 상태 재조회 |
| `REJECTED` | 다시 인증 요청하기 | 필요 | 새 이미지로 재요청 |
| `APPROVED` 또는 `status: ACTIVE` | 없음 | 불필요 | Matching 자동 이동 |

요청 또는 재요청 성공 후 `refreshCurrentUser()`를 호출한다. 즉시 `REQUESTED`가 확인되면 요청 완료 안내를 표시한다. 백엔드 반영이 늦어 필드가 아직 없으면 현재 세션에서 중복 제출을 막고 성공 안내를 표시하되, 새로고침 후에는 다시 서버 응답을 기준으로 한다.

`REQUESTED`에서 인증 확인을 누른 결과:

- `status: ACTIVE` 또는 `APPROVED`: Matching 이동
- `REJECTED`: 거절 안내와 재요청 버튼 표시
- 계속 `REQUESTED`: 검토 중 안내
- 조회 실패: 오류 안내 후 현재 화면 유지

## 오류 및 예외 처리

- 인증 상태 조회 실패는 기존 AuthContext 정책에 따라 비로그인으로 처리한다.
- 알 수 없는 role은 `/login`으로 이동한다.
- `surveyCompleted`가 누락되면 미완료로 취급한다.
- 알 수 없는 `certificationStatus`는 설문 완료 USER에 한해 Certification 단계로 취급한다.
- 기본정보, 설문, 인증 요청 후 상태 갱신이 실패하면 해당 페이지에 머물고 기존 오류 처리 정책을 유지한다.

## 검증

Node 내장 테스트로 `serviceFlow.js`의 다음 조합을 검증한다.

- ADMIN → `/admin`
- GUEST → 동의 단계
- USER/PENDING/설문 미완료/인증 필드 없음 → `/surveys/sleep`
- USER/PENDING/설문 미완료/이상한 인증 상태 → `/surveys/sleep`
- USER/PENDING/설문 완료/인증 필드 없음 → `/certification`
- REQUESTED → `/certification`
- REJECTED → `/certification`
- APPROVED → `/matching`
- USER/ACTIVE → `/matching`
- 사용자 없음 또는 알 수 없는 role → `/login`

추가로 ESLint와 Vite 프로덕션 빌드를 실행한다. 수동 검증에서는 최초 로그인, GUEST 재접속, 기본정보 완료 재접속, 설문 완료, 인증 요청, 거절, 승인 시나리오를 확인한다.
