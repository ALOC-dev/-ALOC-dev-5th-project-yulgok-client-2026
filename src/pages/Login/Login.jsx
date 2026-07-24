import { KAKAO_AUTH_URL } from '../../api/auth/kakaoLogin.js';
import KakaoBtn from './components/KakaoBtn.jsx';

function Login() {
    return (
        <main className="relative min-h-dvh p-5 flex flex-col bg-brand-background pb-[calc(16px+env(safe-area-inset-bottom))]">
            <img src="/uos_logo.svg" alt="uos_logo" aria-hidden="true" className="pointer-events-none absolute right-[-80px] bottom-32 w-[420px] opacity-10 scale-80"/>
            <header className="mt-4 flex justify-start">
                <img src="/logo.svg" alt="율곡" className="h-10 w-auto" />
            </header>
            <section className="flex flex-col items-start gap-y-4 mt-16">
                <h1 className="font-heading font-bold text-fg-primary text-4xl">
                    나와 결이 맞는<br/>
                    룸메이트를 찾는<br/>
                    가장 쉬운 방법<br/>
                </h1>
                <p className="font-body text-fg-basic-muted">
                    서울시립대 기숙사생만을 위한<br/>
                    안전한 룸메이트 매칭 서비스
                </p>
            </section>
            <div className="mt-auto mb-4">
                <a href={KAKAO_AUTH_URL}>
                    <KakaoBtn />
                </a>
                
            </div>
        </main>
    );
}

export default Login;
