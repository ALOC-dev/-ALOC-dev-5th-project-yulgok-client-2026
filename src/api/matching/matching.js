import axios from 'axios';

const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/api/matching`;

export function getMatchingErrorMessage(error, fallbackMessage = '요청을 처리하지 못했어요.') {
  const responseBody = error?.response?.data;
  const message = responseBody?.message || fallbackMessage;
  const details = Array.isArray(responseBody?.errors)
    ? responseBody.errors
        .map((item) => [item?.field, item?.reason].filter(Boolean).join(': '))
        .filter(Boolean)
        .join(', ')
    : '';

  return details ? `${message} (${details})` : message;
}

const MATCH_STATUS_PRIORITY = {
  CONFIRM_PENDING: 8,
  FINAL_CONFIRMED: 7,
  HEART_MATCHED: 6,
  HEART_RECEIVED: 5,
  HEART_SENT: 4,
  RECOMMENDED: 3,
  REJECTED_BY_OTHER: 2,
  CLOSED: 1,
};

function getMatchTimestamp(matchDate) {
  const timestamp = Date.parse(matchDate);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

// 중요한 상태를 먼저 보여주고, 같은 상태에서는 최신 매칭을 우선합니다.
function sortMatchingPeople(people) {
  return [...people].sort((personA, personB) => {
    const priorityDifference =
      (MATCH_STATUS_PRIORITY[personB.matchStatus] ?? 0) -
      (MATCH_STATUS_PRIORITY[personA.matchStatus] ?? 0);

    if (priorityDifference !== 0) return priorityDifference;

    return getMatchTimestamp(personB.matchDate) - getMatchTimestamp(personA.matchDate);
  });
}

// 오늘의 추천 목록을 조회하고 실제 카드 데이터인 responseBody.data만 반환
export async function getMatchingStatus() {
  const accessToken = localStorage.getItem('accessToken');
  const response = await axios.get(`${baseUrl}/status`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const matchingPeople = Array.isArray(response.data?.data) ? response.data.data : [];
  return sortMatchingPeople(matchingPeople);
}

// 새로운 매칭을 생성하는 요청
export async function executeMatching() {
  const accessToken = localStorage.getItem('accessToken');
  const response = await axios.post(
    `${baseUrl}/match`,
    null,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return response.data;
}

// 현재 추천 상대에게 좋아요 또는 거절 의사를 전달합니다.
export async function sendMatchingRequest(receiverId, matchStatus) {
  const accessToken = localStorage.getItem('accessToken');
  const response = await axios.patch(
    `${baseUrl}/requests`,
    {
      receiverId,
      matchStatus,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return response.data;
}
