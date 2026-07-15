import { useEffect, useRef, useState } from "react";
import ProgressBar from "../../components/ProgressBar";
import CertificateBtnGroup from "./components/CertificateBtnGroup";
import DormitoryImageUploader from "./components/DormitoryImageUploader";

function Certification() {
    const [certificateImage, setCertificateImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const previewUrlRef = useRef("");

    useEffect(() => {
        return () => {
            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current);
            }
        };
    }, []);

    const handleImageChange = (file) => {
        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
        }

        const nextPreviewUrl = URL.createObjectURL(file);
        previewUrlRef.current = nextPreviewUrl;
        setCertificateImage(file);
        setPreviewUrl(nextPreviewUrl);
    };

    const handleSubmit = () => {
        if (!certificateImage) {
            return;
        }

        const formData = new FormData();
        formData.append("image", certificateImage);

        // 인증 API가 연결되면 formData를 요청 본문으로 전송합니다.
    };

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
            <section className="flex flex-col flex-1 gap-4">
                <DormitoryImageUploader
                    imageUrl={previewUrl}
                    onChange={handleImageChange}
                />

                <div className="flex items-start gap-3 rounded-select border border-white bg-white p-4">
                    <span
                        aria-hidden="true"
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ui-sub font-bold text-fg-secondary"
                    >
                        i
                    </span>
                    <p className="text-xs leading-relaxed text-fg-basic-muted">
                        사진은 검토 후 <strong className="text-fg-basic">72시간 이내 영구 삭제</strong>됩니다.
                        <br />
                        호실 정보는 매칭 시 같은 동 회원에게만 노출돼요.
                    </p>
                </div>
            </section>
            <CertificateBtnGroup
                prev="/surveys/introduce"
                onSubmit={handleSubmit}
                disabled={!certificateImage}
            />
        </main>
    );
}

export default Certification;
