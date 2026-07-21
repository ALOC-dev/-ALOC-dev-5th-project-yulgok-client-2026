import apiClient from '../client-api.js';

export async function postSurveys(requestBody) {
    const response = await apiClient.post('/api/surveys', requestBody);
    return response.data;
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
