import apiClient from '../client-api.js';

export async function postUserDetails(requestBody) {
    const response = await apiClient.post('/api/users/details', requestBody);
    return response.data;
}
