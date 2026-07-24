import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Slider from './components/Slider';
import ProgressBar from '../../components/ProgressBar';
import MoveBtnGroup from '../../components/MoveBtnGroup';
import RequiredFieldsModal from '../../components/RequiredFieldsModal.jsx';
import {
    getSurveyPath,
    loadSurveyDraft,
    mapSurveyResponseToDraft,
    replaceSurveyDraft,
    saveSurveyDraft,
} from './surveyDraft.js';
import { getMySurvey, getSurveyErrorMessage } from '../../api/surveys/surveys.js';
import LoadingSpinner from '../../components/LoadingSpinner.js';

function SurveySleep() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isEditMode = searchParams.get('mode') === 'edit';
    const [bedtime, setBedtime] = useState(() => loadSurveyDraft().bedtime ?? null);
    const [snoring, setSnoring] = useState(() => loadSurveyDraft().snoring ?? null);
    const [sleepTalking, setSleepTalking] = useState(() => loadSurveyDraft().sleepTalking ?? null);
    const [isLoadingSurvey, setIsLoadingSurvey] = useState(isEditMode);
    const [surveyLoadError, setSurveyLoadError] = useState('');
    const [showRequiredFieldsModal, setShowRequiredFieldsModal] = useState(false);

    useEffect(() => {
        if (isLoadingSurvey) return;
        saveSurveyDraft({ bedtime, snoring, sleepTalking });
    }, [bedtime, snoring, sleepTalking, isLoadingSurvey]);

    useEffect(() => {
        let isMounted = true;

        if (!isEditMode) {
            setIsLoadingSurvey(false);
            return undefined;
        }

        setIsLoadingSurvey(true);
        setSurveyLoadError('');

        getMySurvey()
            .then((survey) => {
                if (!isMounted) return;

                const nextDraft = replaceSurveyDraft(mapSurveyResponseToDraft(survey));
                setBedtime(nextDraft.bedtime);
                setSnoring(nextDraft.snoring);
                setSleepTalking(nextDraft.sleepTalking);
            })
            .catch((error) => {
                if (!isMounted) return;
                console.error('기존 설문 정보를 불러오지 못했습니다.', error);
                setSurveyLoadError(getSurveyErrorMessage(error));
            })
            .finally(() => {
                if (!isMounted) return;
                setIsLoadingSurvey(false);
            });

        return () => {
            isMounted = false;
        };
    }, [isEditMode]);

    function handleNext() {
        if (isLoadingSurvey || surveyLoadError) return;

        if (![bedtime, snoring, sleepTalking].every(Number.isInteger)) {
            setShowRequiredFieldsModal(true);
            return;
        }

        saveSurveyDraft({ bedtime, snoring, sleepTalking });
        navigate(getSurveyPath('/surveys/clean', isEditMode));
    }

    return(
        <main className="flex h-dvh flex-col overflow-hidden bg-brand-background p-5 pb-[calc(16px+env(safe-area-inset-bottom))]">
            <ProgressBar current={2}/>
            <div
                data-survey-scroll-region
                className="min-h-0 flex-1 overflow-y-auto pb-4"
            >
            <header className="flex flex-col my-6 gap-1">
                <p className="font-heading font-bold text-xs text-fg-secondary">
                    수면
                </p>
                <h1 className="font-heading font-extrabold text-lg text-fg-primary">
                    잠과 활동 리듬
                </h1>
                <p className="font-heading text-xs text-fg-basic-muted">

                </p>
            </header>
            {isLoadingSurvey ? (
                <div className="flex min-h-[280px] items-center justify-center text-center text-sm font-bold text-fg-secondary">
                    <LoadingSpinner label="기존 설문 정보를 불러오는 중입니다." size="lg" />
                </div>
            ) : surveyLoadError ? (
                <div className="rounded-2xl bg-white p-5 text-sm font-bold text-[#c04a67] shadow-sm">
                    {surveyLoadError}
                </div>
            ) : (
            <section className="flex flex-col flex-1 gap-8">
                <Slider
                    range={5}
                    value={bedtime}
                    label="취침 시간대"
                    indexLabels={{
                        1: '10시 이전',
                        2: '10시~11시',
                        3: '11시~12시',
                        4: '12시~1시',
                        5: '새벽 1시 이후',
                    }}
                    onChange={setBedtime}
                    required
                />
                <Slider
                    range={5}
                    value={snoring}
                    label="코골이"
                    leftDescription="없음"
                    rightDescription="심함"
                    indexLabels={{ 3: '보통' }}
                    onChange={setSnoring}
                    required
                />
                <Slider
                    range={5}
                    value={sleepTalking}
                    label="잠꼬대"
                    leftDescription="없음"
                    rightDescription="심함"
                    indexLabels={{ 3: '보통' }}
                    onChange={setSleepTalking}
                    required
                />
            </section>
            )}
            </div>
            <div className="shrink-0 bg-brand-background pt-3">
                <MoveBtnGroup
                    prev={isEditMode ? '/my' : '/user/details'}
                    onNext={handleNext}
                    nextDisabled={isLoadingSurvey || Boolean(surveyLoadError)}
                />
            </div>
            <RequiredFieldsModal
                open={showRequiredFieldsModal}
                onClose={() => setShowRequiredFieldsModal(false)}
            />
        </main>
    );
}

export default SurveySleep;
