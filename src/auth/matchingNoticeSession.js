const MATCHING_NOTICE_CONFIRMED_KEY = 'matchingNoticeConfirmed';

export function hasConfirmedMatchingNotice() {
  return sessionStorage.getItem(MATCHING_NOTICE_CONFIRMED_KEY) === 'true';
}

export function confirmMatchingNotice() {
  sessionStorage.setItem(MATCHING_NOTICE_CONFIRMED_KEY, 'true');
}

export function resetMatchingNotice() {
  sessionStorage.removeItem(MATCHING_NOTICE_CONFIRMED_KEY);
}
