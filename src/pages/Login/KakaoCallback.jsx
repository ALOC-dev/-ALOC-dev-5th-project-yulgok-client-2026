import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { postKakaoAuthCode } from '../../api/auth/kakaoLogin.js';

function KakaoCallback() {
    const navigate = useNavigate();
    const requestedRef = useRef(false);

    useEffect(() => {
        if (requestedRef.current) return;
        requestedRef.current = true;
        const authCode = new URLSearchParams(window.location.search).get('code');

        if(!authCode) {
            console.error('카카오 인가 코드가 없습니다.');
            return;
        }

        async function requestAccessToken() {
            try {
                const response = await postKakaoAuthCode(authCode);
                console.log('액세스 토큰 발급 성공');
                localStorage.setItem('accessToken', response.data.accessToken);
                navigate('/user/details');
            }
            catch (error) {
                console.error('액세스 토큰 발급 실패');
            }
        }

        requestAccessToken();
    }, []);

    return <div>로그인 처리 중...</div>;
}

export default KakaoCallback;