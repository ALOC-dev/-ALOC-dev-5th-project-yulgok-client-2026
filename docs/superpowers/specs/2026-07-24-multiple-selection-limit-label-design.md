# 다중 선택 제한 라벨 디자인

## 목표

`중요하게 생각하는 항목` 라벨 옆에 최대 선택 가능 개수를 작고 명확하게 안내한다.

## 표시

- 기존 라벨과 필수 표시를 유지한다.
- 필수 표시 뒤에 `최대 {maxSelections}개`를 추가한다.
- 안내 문구는 `ml-2 text-xs font-normal text-fg-secondary`를 사용한다.
- 기본 `maxSelections` 값이 3이므로 현재 화면에는 `최대 3개`로 표시된다.

## 구현 방식

`MultipleBtnGroup` 내부에서 기존 `maxSelections` prop으로 안내 문구를 생성한다. 선택 제한 로직과 표시 숫자가 같은 값을 사용하므로 서로 어긋나지 않는다. 별도 prop이나 `SurveyIntroduce` 전용 마크업은 추가하지 않는다.

## 범위

현재 `MultipleBtnGroup`은 `SurveyIntroduce`의 `중요하게 생각하는 항목`에서만 사용된다. 버튼 선택 동작, 최대 선택 제한, 필수 표시, 접근성 상태는 변경하지 않는다.

## 검증

- 정적 컴포넌트 계약 테스트로 동적 제한 문구와 `text-xs`, `text-fg-secondary` 스타일을 확인한다.
- 전체 테스트, ESLint, Vite 프로덕션 빌드를 실행한다.
