import apiClient from '../client-api.js';

export async function postSurveys(requestBody) {
    const response = await apiClient.post('/api/surveys', requestBody);
    return response.data;
}

export async function updateSurveys(requestBody) {
    const response = await apiClient.patch('/api/surveys/me', requestBody);
    return response.data;
}

export async function getMySurvey() {
    const response = await apiClient.get('/api/surveys/me');
    return response.data?.data ?? null;
}

export function getSurveyErrorMessage(error) {
    const responseBody = error?.response?.data;
    const validationDetails = Array.isArray(responseBody?.errors)
        ? responseBody.errors
            .map((item) => item?.reason || item?.message)
            .filter(Boolean)
            .join(', ')
        : '';

    return validationDetails || responseBody?.message || '제출에 실패했어요. 잠시 후 다시 시도해주세요.';
}
