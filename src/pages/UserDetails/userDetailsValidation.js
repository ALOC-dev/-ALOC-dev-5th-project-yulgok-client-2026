const requiredStringFields = [
  'realName',
  'gender',
  'phoneNumber',
  'studentId',
  'department',
];

export function hasMissingUserDetails(details) {
  const hasMissingString = requiredStringFields.some(
    (field) => String(details[field] ?? '').trim() === '',
  );
  const age = Number(details.age);

  return hasMissingString || !Number.isFinite(age) || age <= 0;
}

export function isBadRequest(error) {
  return error?.response?.status === 400;
}
