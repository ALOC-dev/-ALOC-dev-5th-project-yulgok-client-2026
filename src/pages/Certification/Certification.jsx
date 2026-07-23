import { useEffect, useRef, useState } from "react";
import ProgressBar from "../../components/ProgressBar";
import CertificateBtnGroup from "./components/CertificateBtnGroup";
import DormitoryImageUploader from "./components/DormitoryImageUploader";
import { useNavigate } from "react-router-dom";
import { certificate, getUploadUrl, uploadCertificationImage } from "../../api/certification/certifications.js";
import { submitCertificationImage } from "../../api/certification/certificationFlow.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import { canAccessCertifiedRoutes } from "../../auth/certificationAccess.js";
import { Modal } from "../../components/Modal/index.js";

function getRequestStorageKey(userId) {
    return `certification-requested:${userId ?? 'current'}`;
}

function Certification() {
    const navigate = useNavigate();
    const { currentUser, refreshCurrentUser } = useAuth();
    const [certificateImage, setCertificateImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [requestedStorageKey, setRequestedStorageKey] = useState(null);
    const [isWorking, setIsWorking] = useState(false);
    const [message, setMessage] = useState("");
    const [showExample, setShowExample] = useState(false);
    const previewUrlRef = useRef("");
    const currentRequestStorageKey = getRequestStorageKey(currentUser?.id);
    const isRequested = requestedStorageKey === currentRequestStorageKey
        || localStorage.getItem(currentRequestStorageKey) === 'true';

    useEffect(() => {
        if (canAccessCertifiedRoutes(currentUser?.status)) {
            localStorage.removeItem(getRequestStorageKey(currentUser?.id));
            navigate('/matching', { replace: true });
        }
    }, [currentUser?.id, currentUser?.status, navigate]);

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

    const handleSubmit = async () => {
        if (isWorking) {
            return;
        }

        setIsWorking(true);
        setMessage("");

        try {
            if (isRequested) {
                const user = await refreshCurrentUser();

                if (canAccessCertifiedRoutes(user?.status)) {
                    localStorage.removeItem(getRequestStorageKey(user?.id));
                    navigate('/matching', { replace: true });
                } else {
                    setMessage('아직 관리자가 인증을 검토하고 있어요.');
                }
                return;
            }

            if (!certificateImage) return;

            await submitCertificationImage(certificateImage, {
                getUploadUrl,
                uploadImage: uploadCertificationImage,
                certificate,
            });

            localStorage.setItem(currentRequestStorageKey, 'true');
            setRequestedStorageKey(currentRequestStorageKey);
            setMessage('인증 요청을 보냈어요. 관리자 승인 후 인증 확인을 눌러주세요.');
        } catch (error) {
            console.error('기숙사 인증 요청 실패', error);
            setMessage(error?.message || '인증 요청 중 문제가 발생했어요. 다시 시도해주세요.');
        } finally {
            setIsWorking(false);
        }
    };

    return (
        <main className="relative min-h-dvh p-5 flex flex-col bg-brand-background pb-[calc(16px+env(safe-area-inset-bottom))]">
            <ProgressBar current={6}/>
            <header className="flex flex-col my-6 gap-1">
                <div className="flex items-center gap-2">
                    <h1 className="font-heading font-extrabold text-lg text-fg-primary">
                        기숙사 인증
                    </h1>
                    <button
                        type="button"
                        onClick={() => setShowExample(true)}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-ui-sub text-xs font-bold text-fg-secondary transition-colors hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                        aria-label="기숙사 인증 사진 예시 보기"
                    >
                        ?
                    </button>
                </div>
                <p className="font-heading text-xs text-fg-basic-muted">
                    인증을 마치면 매칭이 시작돼요.
                </p>
            </header>
            <section className="flex flex-col flex-1 gap-4">
                <DormitoryImageUploader
                    imageUrl={previewUrl}
                    onChange={handleImageChange}
                />

                {message && (
                    <p className="text-center text-xs font-semibold text-fg-basic-muted" role="status">
                        {message}
                    </p>
                )}

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
                disabled={isWorking || (!isRequested && !certificateImage)}
                label={isWorking ? '확인 중...' : isRequested ? '인증 확인' : '인증 요청 보내기'}
            />

            <Modal
                open={showExample}
                onClose={() => setShowExample(false)}
                title="기숙사 인증 사진 예시"
                description="대학행정정보시스템에서 본인의 이름이 보이도록 전체 화면을 캡처해 주세요."
                size="large"
            >
                <figure className="m-0 overflow-hidden rounded-lg border border-[var(--border)] bg-ui-sub">
                    <img
                        src="/images/cert-example.png"
                        alt="대학행정정보시스템 화면에서 본인 이름과 기숙사 입사 신청 내역을 표시한 인증 사진 예시"
                        className="block h-auto w-full object-contain"
                    />
                </figure>
                <ul className="mb-0 mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-fg-basic-muted">
                    <li>우측 상단에 로그인한 본인의 이름이 보여야 합니다.</li>
                    <li>기숙사 입사 신청 또는 합격 내역이 함께 보이도록 전체 화면을 캡처해 주세요.</li>
                    <li>주민등록번호, 연락처 등 불필요한 개인정보는 반드시 가려 주세요.</li>
                </ul>
                <Modal.Footer>
                    <Modal.Button onClick={() => setShowExample(false)}>
                        확인
                    </Modal.Button>
                </Modal.Footer>
            </Modal>
        </main>
    );
}

export default Certification;
