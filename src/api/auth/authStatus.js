import apiClient from '../client-api.js';

export async function getCurrentUserId() {
  const response = await apiClient.get('/api/auth/status');

  return response.data?.data?.user?.id ?? null;
}
