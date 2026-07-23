import apiClient from '../client-api.js';

export async function postUserDetails(requestBody) {
    const response = await apiClient.post('/api/users/details', requestBody);
    return response.data;
}

export async function changeNickname(nickname) {
    const response = await apiClient.patch('/api/users/me', {nickname});
    return response.data?.data?.nickname;
}