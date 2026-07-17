import axios from 'axios';

const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/api/matching`;

// 오늘의 추천 목록을 조회하고 실제 카드 데이터인 responseBody.data만 반환
export async function getMatchingStatus() {
  const accessToken = localStorage.getItem('accessToken');
  const response = await axios.get(`${baseUrl}/status`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return Array.isArray(response.data?.data) ? response.data.data : [];
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
