import { useEffect } from 'react';
import { postKakaoAuthCode } from '../../api/auth/kakaoLogin.js';

function KakaoCallback() {
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const authCode = urlParams.get('code');

        if(!authCode) {
            console.error('카카오 인가 코드가 없습니다.');
            return;
        }

        async function requestAccessToken() {
            try {
                const data = await postKakaoAuthCode(authCode);
                console.log('액세스 토큰 발급 성공');
                localStorage.setItem('accessToken', data.accessToken);
                window.location.href = '../UserDetails/UserDetails.jsx';
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