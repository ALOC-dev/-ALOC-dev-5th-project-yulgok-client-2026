/* api 모듈화를 위한 공통부 axios 인스턴스 */

import axios from 'axios';
import {
    getAccessToken,
    setAccessToken,
    removeAccessToken,
} from '../auth/tokenStorage.js';
import {
    notifyAuthExpired,
    notifyTokenRefreshed,
} from '../auth/authEvents.js';

const baseURL = import.meta.env.VITE_API_BASE_URL;

// 일반 API 요청에 사용하는 axios 인스턴스
const apiClient = axios.create({
    baseURL,
});

// refresh 전용 인스턴스
// apiClient로 refresh 요청 보내면 401응답도 다시 refresh되는 무한 반복 발생 가능 -> 별도 인스턴스 사용
const refreshClient = axios.create({
    baseURL,
    withCredentials: true,
})

// 여러 요청이 동시에 401 반환해도 refresh 요청은 한 번만 실행되도록 Promise 공유.
// Promise는 get/post 등의 비동기 작업.
let refreshPromise = null;

export async function refreshAccessToken() {
    if(!refreshPromise) {
        refreshPromise = refreshClient
            .post('/api/auth/refresh')
            .then((response) => {
                const newAccessToken = response.data?.data?.accessToken;
                
                if(!newAccessToken) {
                    throw new Error('토큰 재발급 응답에 accessToken이 없습니다.');
                }

                setAccessToken(newAccessToken);
                notifyTokenRefreshed();

                return newAccessToken;
            })
            .catch((error) => {
                removeAccessToken();
                notifyAuthExpired();

                throw error;
            })
            .finally(() => {
                refreshPromise = null;
            })
    }

    return refreshPromise;
}

// 모든 일반 API 요청 직전에 accessToken을 자동으로 넣음.
apiClient.interceptors.request.use(
    (config) => {
        const accessToken = getAccessToken();

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error),
);

// api가 401을 반환하면 accessToken 재발급 후 원래 요청을 재시도
apiClient.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;

        /*
          네트워크 오류처럼 응답이 없는 경우나 401이 아닌 오류는
          refresh하지 않고 원래 오류를 전달 
        */
        if (status !== 401 || !originalRequest) {
            return Promise.reject(error);
        }

        // 이미 refresh 후 한 번 재시도한 요청이면 refreshToken도 만료된 것이므로 반복X.
        if(originalRequest._retry) {
            removeAccessToken();
            notifyAuthExpired();

            return Promise.reject(error);
        }

        // 401이면 재시도
        originalRequest._retry = true;

        try {
            const newAccessToken = await refreshAccessToken();

            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            return apiClient(originalRequest);
        } catch (refreshError) {
            return Promise.reject(refreshError);
        }
    },
);

export default apiClient;
