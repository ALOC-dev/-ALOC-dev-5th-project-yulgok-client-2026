export function getUserDetailsSubmitter(
  role,
  { postUserDetails, patchUserDetails },
) {
  if (role === 'GUEST') return postUserDetails;
  if (role === 'USER' || role === 'ADMIN') return patchUserDetails;

  throw new Error(`Unsupported user role: ${role ?? 'missing'}`);
}
