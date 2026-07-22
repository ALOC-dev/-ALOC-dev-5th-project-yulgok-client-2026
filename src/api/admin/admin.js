import apiClient from '../client-api.js';

export const certificationStatuses = ['REQUESTED', 'APPROVED', 'REJECTED'];

export function getAdminErrorMessage(error, fallbackMessage = '요청을 처리하지 못했어요.') {
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

export async function getCurrentUser() {
  const response = await apiClient.get('/api/auth/status');
  return response.data?.data?.user ?? null;
}

export async function getAdminUsers({ page = 0, size = 20 } = {}) {
  const response = await apiClient.get('/api/admin/users', {
    params: { page, size },
  });

  const data = response.data?.data ?? {};
  return {
    users: Array.isArray(data.users) ? data.users : [],
    page: Number(data.page) || 0,
    size: Number(data.size) || size,
    totalElements: Number(data.totalElements) || 0,
    totalPages: Number(data.totalPages) || 0,
    hasNext: Boolean(data.hasNext),
  };
}

export async function banUser(userId) {
  const response = await apiClient.patch(`/api/admin/users/${userId}/ban`);
  return response.data?.data ?? null;
}

export async function unbanUser(userId) {
  const response = await apiClient.patch(`/api/admin/users/${userId}/unban`);
  return response.data?.data ?? null;
}

export async function getAdminCertifications({ status, page = 0 } = {}) {
  const response = await apiClient.get('/api/admin/certifications', {
    params: {
      ...(status ? { status } : {}),
      page,
    },
  });

  return Array.isArray(response.data?.data) ? response.data.data : [];
}

export async function getAdminCertification(certificationId) {
  const response = await apiClient.get(`/api/admin/certifications/${certificationId}`);
  return response.data?.data ?? null;
}

export async function approveCertification(certificationId) {
  const response = await apiClient.patch(`/api/admin/certifications/${certificationId}/approve`);
  return response.data?.data ?? null;
}

export async function rejectCertification(certificationId, adminComment) {
  const response = await apiClient.patch(
    `/api/admin/certifications/${certificationId}/reject`,
    { adminComment },
  );

  return response.data?.data ?? null;
}

export async function getMatchingConfig() {
  const response = await apiClient.get('/api/admin/match/config');
  return response.data?.data ?? {
    matchStartDate: '',
    matchEndDate: '',
  };
}

export async function updateMatchingConfig(data) {
  const response = await apiClient.patch('/api/admin/match/config', data);
  return response.data?.data ?? null;
}
