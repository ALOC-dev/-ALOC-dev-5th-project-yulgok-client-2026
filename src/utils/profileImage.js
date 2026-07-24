export const PROFILE_IMAGE_BASE_PATH = '/images/profile-avatars/';
export const PROFILE_IMAGE_FALLBACK_URL = '/favicon.svg';

export function getProfileImageUrl(profileImageUrl, fallbackUrl = PROFILE_IMAGE_FALLBACK_URL) {
  if (!profileImageUrl || profileImageUrl === 'string') return fallbackUrl;

  if (
    profileImageUrl.startsWith('http://') ||
    profileImageUrl.startsWith('https://') ||
    profileImageUrl.startsWith('/')
  ) {
    return profileImageUrl;
  }

  return `${PROFILE_IMAGE_BASE_PATH}${profileImageUrl}`;
}
