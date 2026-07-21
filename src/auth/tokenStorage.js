/* accessToken 저장 기능 분리 */

const ACCESS_TOKEN_KEY = 'accessToken';

export function getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(accessToken) {
    if(!accessToken) {
        throw new Error('저장할 accessToken이 없습니다.');
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

export function removeAccessToken() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
}