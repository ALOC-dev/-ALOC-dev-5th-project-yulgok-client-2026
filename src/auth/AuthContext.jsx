import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import apiClient from '../api/client-api.js';
import {
    getAccessToken,
    setAccessToken,
    removeAccessToken,
} from './tokenStorage.js';
import {
    AUTH_EXPIRED_EVENT,
    TOKEN_REFRESHED_EVENT,
} from './authEvents.js';
import { getCurrentUser } from '../api/auth/authStatus.js';
import { createAuthOperationCoordinator } from './authOperationCoordinator.js';
import { resetMatchingNotice } from './matchingNoticeSession.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // 앱이 처음 실행됐을 땐 인증 확인이 아직 끝나지 않음 -> true
    const [authState, setAuthState] = useState({
        currentUser: null,
        isAuthenticated: true,
        isCheckingAuth: true,
    });
    const {
        currentUser,
        isAuthenticated,
        isCheckingAuth,
    } = authState;
    const [authCoordinator] = useState(() => (
        createAuthOperationCoordinator({
            commitAuthenticated(user) {
                setAuthState({
                    currentUser: user,
                    isAuthenticated: true,
                    isCheckingAuth: false,
                });
            },
            commitTokenRefreshed() {
                setAuthState((currentState) => ({
                    ...currentState,
                    isAuthenticated: true,
                }));
            },
            commitUnauthenticated() {
                setAuthState({
                    currentUser: null,
                    isAuthenticated: false,
                    isCheckingAuth: false,
                });
            },
            loadCurrentUser: getCurrentUser,
            removeAccessToken,
            setAccessToken,
        })
    ));

    useEffect(() => {
        window.addEventListener(
            AUTH_EXPIRED_EVENT,
            authCoordinator.handleAuthExpired,
        );
        window.addEventListener(
            TOKEN_REFRESHED_EVENT,
            authCoordinator.handleTokenRefreshed,
        );

        authCoordinator.bootstrap().catch((error) => {
            console.error('인증 상태 확인 실패', error);
        });

        return () => {
            window.removeEventListener(
                AUTH_EXPIRED_EVENT,
                authCoordinator.handleAuthExpired,
            );
            window.removeEventListener(
                TOKEN_REFRESHED_EVENT,
                authCoordinator.handleTokenRefreshed,
            );
        };
    }, [authCoordinator]);

    const refreshCurrentUser = useCallback(async () => {
        const user = await getCurrentUser();

        setAuthState((currentState) => ({
            ...currentState,
            currentUser: user,
            isAuthenticated: true,
        }));

        return user;
    }, []);

    const completeLogin = useCallback(async (accessToken) => {
        resetMatchingNotice();
        return authCoordinator.completeLogin(accessToken);
    }, [authCoordinator]);

    const logout = useCallback(async () => {
        try {
            await apiClient.post('/api/auth/logout', undefined, {
                withCredentials: true,
            });
        } finally {
            removeAccessToken();
            resetMatchingNotice();
            setAuthState({
                currentUser: null,
                isAuthenticated: false,
                isCheckingAuth: false,
            });
        }
    }, []);

  const value = useMemo(
    () => ({
        accessToken: getAccessToken(),
        completeLogin,
        isAuthenticated,
        isCheckingAuth,
        currentUser,
        refreshCurrentUser,
        logout,
    }),
    [
        completeLogin,
        currentUser,
        isAuthenticated,
        isCheckingAuth,
        logout,
        refreshCurrentUser,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);

    if(!context) {
        throw new Error('useAuth는 AuthProvider 안에서 사용해야 합니다.');
    }

    return context;
}
