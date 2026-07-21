import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { postKakaoAuthCode } from '../../api/auth/kakaoLogin.js';
import { useAuth } from '../../auth/AuthContext.jsx';

function KakaoCallback() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const requestedRef = useRef(false);

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

        /*
         * 현재 카카오 로그인 과정에서는 state.from이 콜백까지
         * 자동 전달되지 않을 가능성이 있으므로 기본 주소를 사용합니다.
         */
        const destination =
          location.state?.from?.pathname ?? '/user/details';

        navigate(destination, { replace: true });
      } catch (error) {
        console.error('accessToken 발급 실패:', error);
        navigate('/login', { replace: true });
      }
    }

        requestAccessToken();
    }, [location.state, login, navigate]);

    return <div>로그인 처리 중...</div>;
}

export default KakaoCallback;