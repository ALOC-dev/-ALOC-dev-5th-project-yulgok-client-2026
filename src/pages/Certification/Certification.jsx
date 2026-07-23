import { useEffect, useRef, useState } from "react";
import ProgressBar from "../../components/ProgressBar";
import CertificateBtnGroup from "./components/CertificateBtnGroup";
import DormitoryImageUploader from "./components/DormitoryImageUploader";
import { useNavigate } from "react-router-dom";
import { certificate, getUploadUrl, uploadCertificationImage } from "../../api/certification/certifications.js";
import { submitCertificationImage } from "../../api/certification/certificationFlow.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import { canAccessCertifiedRoutes } from "../../auth/serviceFlow.js";

function isCertificationEligible(user) {
    return user?.role === 'USER' && user?.surveyCompleted === true;
}

function Certification() {
    const navigate = useNavigate();
    const { currentUser, refreshCurrentUser } = useAuth();
    const [certificateImage, setCertificateImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [requestedThisSession, setRequestedThisSession] = useState(false);
    const [isWorking, setIsWorking] = useState(false);
    const [message, setMessage] = useState("");
    const previewUrlRef = useRef("");
    const certificationStatus = isCertificationEligible(currentUser)
        ? currentUser?.certificationStatus
        : undefined;
    const isRequested =
        certificationStatus === 'REQUESTED' || requestedThisSession;
    const isRejected = certificationStatus === 'REJECTED';

    useEffect(() => {
        if (canAccessCertifiedRoutes(currentUser)) {
            navigate('/matching', { replace: true });
        }
    }, [currentUser, navigate]);

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

                if (canAccessCertifiedRoutes(user)) {
                    navigate('/matching', { replace: true });
                } else if (
                    isCertificationEligible(user)
                    && user.certificationStatus === 'REJECTED'
                ) {
                    setRequestedThisSession(false);
                    setMessage('인증이 반려됐어요. 사진을 확인한 뒤 다시 요청해주세요.');
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

            setRequestedThisSession(true);
            setMessage('인증 요청을 보냈어요. 관리자 승인 후 인증 확인을 눌러주세요.');

            try {
                const user = await refreshCurrentUser();

                if (canAccessCertifiedRoutes(user)) {
                    navigate('/matching', { replace: true });
                }
            } catch (refreshError) {
                console.error('인증 상태 새로고침 실패', refreshError);
            }
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
                label={
                    isWorking
                        ? '확인 중...'
                        : isRequested
                            ? '인증 확인'
                            : isRejected
                                ? '다시 인증 요청하기'
                                : '인증 요청 보내기'
                }
            />
        </main>
    );
}

export default Certification;
