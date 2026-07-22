import apiClient from '../client-api.js';

export async function getUploadUrl(fileName, contentType) {
    const response = await apiClient.post('/api/certifications/presigned-url', {fileName, contentType});
    const uploadUrl = response.data?.data?.uploadUrl;
    const imageKey = response.data?.data?.imageKey;
    if (!uploadUrl || !imageKey) {
        throw new Error('이미지 업로드 정보를 가져오는 데 실패했습니다.');
    }
    return { uploadUrl, imageKey };
}

export async function uploadCertificationImage(uploadUrl, file, contentType) {
    const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': contentType,
        },
        body: file,
    });

    if (!response.ok) {
        throw new Error('이미지를 업로드하는 데 실패했습니다.');
    }
}

export async function certificate(imageKey) {
    const response = await apiClient.post('/api/certifications', {imageKey});
    return response.data?.data;
}
