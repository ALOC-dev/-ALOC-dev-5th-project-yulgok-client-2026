import axios from 'axios';

const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/api/auth`;

export async function getCurrentUserId() {
  const accessToken = localStorage.getItem('accessToken');
  const response = await axios.get(`${baseUrl}/status`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data?.data?.user?.id ?? null;
}
