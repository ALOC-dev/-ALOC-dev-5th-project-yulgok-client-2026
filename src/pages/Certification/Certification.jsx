import ProgressBar from "../../components/ProgressBar";
import CertificateBtnGroup from "./components/CertificateBtnGroup";

function Certification() {
    return (
        <main className="relative min-h-dvh p-5 flex flex-col bg-brand-background pb-[calc(16px+env(safe-area-inset-bottom))]">
            <ProgressBar current={6}/>
            <header className="flex flex-col my-6 gap-1">
                <h1 className="font-heading font-extrabold text-lg text-fg-primary">
                    기숙사 인증
                </h1>
                <p className="font-heading text-xs text-fg-basic-muted">
                    인증을 마치면 매칭이 시작돼요.
                </p>
            </header>
            <section className="flex flex-col flex-1 gap-8">
                
            </section>
            <CertificateBtnGroup prev="/surveys/introduce" />
        </main>
    );
}

export default Certification;