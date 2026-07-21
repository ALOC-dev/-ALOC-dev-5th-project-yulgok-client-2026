export const AUTH_EXPIRED_EVENT = 'auth:expired';
export const TOKEN_REFRESHED_EVENT = 'auth:token-refreshed';

export function notifyAuthExpired() {
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
}

export function notifyTokenRefreshed() {
    window.dispatchEvent(new Event(TOKEN_REFRESHED_EVENT));
}