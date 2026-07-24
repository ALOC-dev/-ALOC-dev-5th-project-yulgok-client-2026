import apiClient from '../client-api.js';

export async function postUserDetails(requestBody) {
    const response = await apiClient.post('/api/users/details', requestBody);
    return response.data;
}

export async function changeNickname(nickname) {
    const response = await apiClient.patch('/api/users/me', {nickname});
    return response.data?.data?.nickname;
}

export async function getUserProfile() {
    const response = await apiClient.get('/api/users/me');
    return response.data?.data ?? null;
}

export async function updateUserProfile(requestBody) {
    const response = await apiClient.patch('/api/users/me', requestBody);
    return response.data?.data ?? null;
}

export async function deleteMyAccount() {
    const response = await apiClient.delete('/api/users/me');
    return response.data;
}
