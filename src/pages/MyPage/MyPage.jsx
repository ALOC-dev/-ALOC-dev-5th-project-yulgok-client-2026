import { useState } from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';

function MyPage() {
    const { logout } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    async function handleLogout() {
        if (isLoggingOut) return;

        setIsLoggingOut(true);

        try {
            await logout();
        } catch (error) {
            console.error('로그아웃 요청 실패', error);
        } finally {
            setIsLoggingOut(false);
        }
    }

    return (
        <main className="flex min-h-dvh items-center justify-center bg-brand-background p-5">
            <button
                type="button"
                className="rounded-full bg-brand-primary px-6 py-3 font-bold text-white disabled:cursor-wait disabled:opacity-60"
                disabled={isLoggingOut}
                onClick={handleLogout}
            >
                {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
            </button>
        </main>
    );
}

export default MyPage;
