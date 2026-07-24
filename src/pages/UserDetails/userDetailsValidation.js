const requiredFields = [
  'realName',
  'age',
  'gender',
  'phoneNumber',
  'studentId',
  'department',
];

export function formatPhoneNumber(value) {
  const digits = String(value ?? '').replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function hasMissingUserDetails(details) {
  return requiredFields.some(
    (field) => String(details[field] ?? '').trim() === '',
  );
}

export function getUserDetailsFieldErrors(details) {
  const errors = {};
  const age = Number(details.age);

  if (!Number.isInteger(age) || age <= 0) {
    errors.age = '나이가 올바르지 않습니다.';
  }
  if (!/^010-\d{4}-\d{4}$/.test(String(details.phoneNumber))) {
    errors.phoneNumber = '전화번호 형식이 올바르지 않습니다.';
  }
  if (String(details.studentId).length !== 10) {
    errors.studentId = '학번 형식이 올바르지 않습니다.';
  }

  return errors;
}

export function isBadRequest(error) {
  return error?.response?.status === 400;
}
