import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../api/auth/authStatus.js';
import { postKakaoAuthCode } from '../../api/auth/kakaoLogin.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import PrivacyConsentModal from '../../components/PrivacyConsentModal.jsx';

const PRIVACY_CONSENT_KEY = 'privacyConsent';
const PRIVACY_CONSENT_VERSION = '2026-07-22';

function KakaoCallback() {
    const navigate = useNavigate();
    const { login, logout } = useAuth();
    const requestedRef = useRef(false);
    const [consentDestination, setConsentDestination] = useState(null);

    useEffect(() => {
        if (requestedRef.current) return;

        requestedRef.current = true;

        const authCode = new URLSearchParams(window.location.search).get('code');

        if(!authCode) {
            console.error('카카오 인가 코드가 없습니다.');
            navigate('/login', {replace: true});
            return;
        }

        async function requestAccessToken() {
      try {
        const responseBody = await postKakaoAuthCode(authCode);
        const accessToken = responseBody?.data?.accessToken;

        if (!accessToken) {
          throw new Error('응답에 accessToken이 없습니다.');
        }

        login(accessToken);
        const currentUser = await getCurrentUser();

        /*
         * 현재 카카오 로그인 과정에서는 state.from이 콜백까지
         * 자동 전달되지 않을 가능성이 있으므로 기본 주소를 사용합니다.
         */
        if (currentUser?.role === 'ADMIN') {
          navigate('/admin', { replace: true });
          return;
        }

        setConsentDestination('/onboarding');
      } catch (error) {
        console.error('accessToken 발급 실패:', error);
        navigate('/login', { replace: true });
      }
    }

        requestAccessToken();
    }, [login, navigate]);

    const handleAgree = (agreements) => {
      localStorage.setItem(
        PRIVACY_CONSENT_KEY,
        JSON.stringify({
          ...agreements,
          agreedAt: new Date().toISOString(),
          version: PRIVACY_CONSENT_VERSION,
        }),
      );
      navigate(consentDestination ?? '/onboarding', { replace: true });
    };

    const handleDecline = async () => {
      localStorage.removeItem(PRIVACY_CONSENT_KEY);

      try {
        await logout();
      } catch (error) {
        console.error('동의 거부 후 로그아웃 실패:', error);
      } finally {
        navigate('/login', { replace: true });
      }
    };

    return (
      <main className="grid min-h-dvh place-items-center bg-brand-background">
        <p className="text-sm text-fg-basic-muted">
          {consentDestination ? '서비스 이용 동의가 필요합니다.' : '로그인 처리 중...'}
        </p>
        <PrivacyConsentModal
          open={Boolean(consentDestination)}
          onAgree={handleAgree}
          onDecline={handleDecline}
        />
      </main>
    );
}

export default KakaoCallback;
