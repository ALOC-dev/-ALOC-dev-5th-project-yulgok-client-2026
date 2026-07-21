import {
    Navigate,
    Outlet,
    useLocation,
} from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

function ProtectedRoute() {
    const location = useLocation();
    const {
        isAuthenticated,
        isCheckingAuth,
    } = useAuth();

    // 인증상태 확인 끝나기 전 로그인 페이지로 이동시키면 
    // refresh 성공해도 화면 잠깐 튀는 문제 발생.
    if(isCheckingAuth) {
        return (
            <main className="flex min-h-dvh items-center justify-center">
                <p>로그인 상태를 확인하고 있습니다...</p>
            </main>
        );
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    return <Outlet />;
}

export default ProtectedRoute;
