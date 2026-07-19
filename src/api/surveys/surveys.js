import axios from 'axios';

const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/api/surveys`;

export async function postSurveys(requestBody) {
    const accessToken = localStorage.getItem('accessToken');

    const response = await axios.post(baseUrl, requestBody, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        }
    });
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
