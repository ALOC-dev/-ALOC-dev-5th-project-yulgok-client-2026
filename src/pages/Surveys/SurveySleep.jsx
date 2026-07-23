import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from './components/Slider';
import ProgressBar from '../../components/ProgressBar';
import MoveBtnGroup from '../../components/MoveBtnGroup';
import { loadSurveyDraft, saveSurveyDraft } from './surveyDraft.js';

function SurveySleep() {
    const navigate = useNavigate();
    const [bedtime, setBedtime] = useState(() => loadSurveyDraft().bedtime ?? null);
    const [snoring, setSnoring] = useState(() => loadSurveyDraft().snoring ?? null);
    const [sleepTalking, setSleepTalking] = useState(() => loadSurveyDraft().sleepTalking ?? null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        saveSurveyDraft({ bedtime, snoring, sleepTalking });
    }, [bedtime, snoring, sleepTalking]);

    function handleNext() {
        if (![bedtime, snoring, sleepTalking].every(Number.isInteger)) {
            setErrorMessage('수면 설문의 모든 항목을 선택해주세요.');
            return;
        }

        setErrorMessage('');
        saveSurveyDraft({ bedtime, snoring, sleepTalking });
        navigate('/surveys/clean');
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
            <section className="flex flex-col flex-1 gap-8">
                <Slider
                    range={5}
                    value={bedtime}
                    label="취침 시간대"
                    leftDescription="10시 이전"
                    rightDescription="새벽 1시 이후"
                    onChange={setBedtime}
                    required
                />
                <Slider
                    range={5}
                    value={snoring}
                    label="코골이"
                    leftDescription="없음"
                    rightDescription="심함"
                    onChange={setSnoring}
                    required
                />
                <Slider
                    range={5}
                    value={sleepTalking}
                    label="잠꼬대"
                    leftDescription="없음"
                    rightDescription="심함"
                    onChange={setSleepTalking}
                    required
                />
            </section>
            {errorMessage && <p className="mb-3 text-xs font-bold text-[#c04a67]" role="alert">{errorMessage}</p>}
            </div>
            <div className="shrink-0 bg-brand-background pt-3">
                <MoveBtnGroup
                    prev='/user/details'
                    onNext={handleNext}
                />
            </div>
        </main>
    );
}

export default SurveySleep;
