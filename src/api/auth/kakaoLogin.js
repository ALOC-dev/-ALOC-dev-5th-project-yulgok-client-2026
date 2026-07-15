import axios from "axios"

const clientId = import.meta.env.VITE_CLIENT_ID;
const redirectUri = import.meta.env.VITE_REDIRECT_URI;
const baseUrl=import.meta.env.VITE_API_BASE_URL;

// 카카오 인가 코드 요청 URL
export const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;

// 카카오 인가 코드 백엔드에 전달
export async function postKakaoAuthCode(authCode) {
    const reponse = await axios.get(`${baseUrl}/api/auth/kakao/callback?code=${authCode}`);
    return reponse.data;
}