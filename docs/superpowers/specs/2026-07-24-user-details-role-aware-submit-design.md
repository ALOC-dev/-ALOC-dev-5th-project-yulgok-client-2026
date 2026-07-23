# UserDetails role 기반 제출 설계

## 문제와 원인

`UserDetails`는 현재 사용자의 role과 관계없이 항상 사용자 상세 생성 POST를 호출한다. 최초 제출로 사용자가 `GUEST`에서 `USER`가 된 뒤 다시 제출하면 이미 존재하는 상세 정보에 생성 요청을 보내므로 HTTP 409가 발생한다.

## 목표

다음 버튼 클릭 시 최신 인증 status의 role을 확인하고, `GUEST`는 최초 생성 POST를, `USER`는 수정 PATCH를 호출한다.

## 제출 흐름

1. 기존 필수 입력 검증을 먼저 수행한다.
2. 누락된 입력이 있으면 status와 상세 정보 API를 호출하지 않고 기존 필수 입력 모달을 연다.
3. 검증을 통과하면 `refreshCurrentUser()`로 최신 status를 조회하고 반환된 `role`을 확인한다.
4. role이 `GUEST`이면 `postUserDetails(requestBody)`를 호출한다.
5. GUEST의 POST가 성공하면 `refreshCurrentUser()`를 한 번 더 호출해 전역 사용자 상태의 role을 `USER`로 갱신한다.
6. role이 `USER`이면 `patchUserDetails(requestBody)`를 호출하고 추가 status 조회는 하지 않는다.
7. 제출이 성공하면 `/surveys/sleep`으로 이동한다.
8. 알 수 없거나 없는 role에는 POST 또는 PATCH를 추측 호출하지 않고 오류를 발생시켜 기존 일반 오류 경로로 처리한다.

## 오류 처리

- POST와 PATCH 모두 HTTP 400이면 기존 `RequiredFieldsModal`을 표시한다.
- status 조회, 알 수 없는 role, 400이 아닌 제출 오류는 기존처럼 콘솔에 기록하며 이동하지 않는다.
- HTTP 409를 PATCH 재시도로 숨기지 않고, 최신 status를 기준으로 올바른 메서드를 처음부터 선택한다.

## API

- 기존 `postUserDetails(requestBody)`를 GUEST 생성에 사용한다.
- 현재 작업 트리에 추가된 `patchUserDetails(requestBody)`를 USER 수정에 사용한다.
- `patchUserDetails`는 `/api/users/details`에 PATCH 요청을 보내고 응답 본문을 반환한다.

## 테스트

- GUEST role이 POST를 선택하는지 검사한다.
- USER role이 PATCH를 선택하는지 검사한다.
- 알 수 없는 role에서 API 호출 함수를 선택하지 않고 오류가 발생하는지 검사한다.
- UserDetails가 입력 검증 후 status를 조회하고 role에 따라 제출 함수를 선택하는지 검사한다.
- GUEST 성공 경로에만 두 번째 `refreshCurrentUser()`가 있는지 검사한다.
- 집중 테스트, 린트, 프로덕션 빌드를 실행한다.
