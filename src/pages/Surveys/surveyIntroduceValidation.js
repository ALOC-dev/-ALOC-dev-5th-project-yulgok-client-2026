export function hasMissingSurveyIntroduceFields({
  nickname,
  introduce,
  visibleProfileFields,
}) {
  return (
    !nickname.trim()
    || !introduce.trim()
    || visibleProfileFields.length < 1
  );
}

export function isSurveyBadRequest(error) {
  return error?.response?.status === 400;
}
