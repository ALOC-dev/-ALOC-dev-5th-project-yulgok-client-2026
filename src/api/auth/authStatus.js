import apiClient from '../client-api.js';

export async function getCurrentUser() {
  const response = await apiClient.get('/api/auth/status');

  return response.data?.data?.user ?? null;
}

export async function getCurrentUserId() {
  const user = await getCurrentUser();

  return user?.id ?? null;
}
