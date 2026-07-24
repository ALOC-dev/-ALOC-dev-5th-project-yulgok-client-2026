import {useEffect, useState} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProgressBar from '../../components/ProgressBar';
import RadioBtnGroup from '../../components/RadioBtnGroup';
import MoveBtnGroup from '../../components/MoveBtnGroup';
import { getSurveyPath, loadSurveyDraft, saveSurveyDraft } from './surveyDraft.js';

function SurveyLiving() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isEditMode = searchParams.get('mode') === 'edit';
    const [smokingStatus, setSmokingStatus] = useState(() => loadSurveyDraft().smokingStatus ?? null);
    const [eatingInRoom, setEatingInRoom] = useState(() => loadSurveyDraft().eatingInRoom ?? null);
    const [temperaturePreference, setTemperaturePreference] = useState(() => loadSurveyDraft().temperaturePreference ?? null);
    const [speakerStyle, setSpeakerStyle] = useState(() => loadSurveyDraft().speakerStyle ?? null);
    const [callInRoom, setCallInRoom] = useState(() => loadSurveyDraft().callInRoom ?? null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        saveSurveyDraft({ smokingStatus, eatingInRoom, temperaturePreference, speakerStyle, callInRoom });
    }, [smokingStatus, eatingInRoom, temperaturePreference, speakerStyle, callInRoom]);

    function handleNext() {
        const answers = [smokingStatus, eatingInRoom, temperaturePreference, speakerStyle, callInRoom];
        if (!answers.every(Number.isInteger)) {
            setErrorMessage('생활 설문의 모든 항목을 선택해주세요.');
            return;
        }

        setErrorMessage('');
        saveSurveyDraft({ smokingStatus, eatingInRoom, temperaturePreference, speakerStyle, callInRoom });
        navigate(getSurveyPath('/surveys/introduce', isEditMode));
    }

    return(
        <main className="flex h-dvh flex-col overflow-hidden bg-brand-background p-5 pb-[calc(16px+env(safe-area-inset-bottom))]">
            <ProgressBar current={4}/>
            <div
                data-survey-scroll-region
                className="min-h-0 flex-1 overflow-y-auto pb-4"
            >
            <header className="flex flex-col my-6 gap-1">
                <p className="font-heading font-bold text-xs text-fg-secondary">
                    생활
                </p>
                <h1 className="font-heading font-extrabold text-lg text-fg-primary">
                    방 안 생활 습관
                </h1>
                <p className="font-heading text-xs text-fg-basic-muted">

                </p>
            </header>
            <section className="flex flex-col flex-1 gap-8">
                <RadioBtnGroup
                    name="smokingStatus"
                    label="흡연 여부"
                    items={[
                        {item: "흡연자", value:1},
                        {item: "비흡연자", value:0}
                    ]}
                    onChange={setSmokingStatus}
                    value={smokingStatus}
                    required
                    className="flex-1"
                    layout=""
                    labelStyle="block text-sm font-bold text-fg-basic"
                />
                <RadioBtnGroup
                    name="eatingInRoom"
                    label="방 안 취식"
                    items={[
                        {item: "자주", value:1},
                        {item: "가끔", value:2},
                        {item: "안함", value:3},
                    ]}
                    onChange={setEatingInRoom}
                    value={eatingInRoom}
                    required
                    className="flex-1"
                    layout=""
                    labelStyle="block text-sm font-bold text-fg-basic"
                />
                <RadioBtnGroup
                    name="temperaturePreference"
                    label="실내 온도 선호"
                    items={[
                        {item: "시원하게", value:1},
                        {item: "적당히", value:2},
                        {item: "따뜻하게", value:3},
                    ]}
                    onChange={setTemperaturePreference}
                    value={temperaturePreference}
                    required
                    className="flex-1"
                    layout=""
                    labelStyle="block text-sm font-bold text-fg-basic"
                />
                <RadioBtnGroup
                    name="speakerStyle"
                    label="음악·영상 감상 방식"
                    items={[
                        {item: "이어폰", value:1},
                        {item: "스피커", value:2},
                        {item: "둘 다", value:3},
                    ]}
                    onChange={setSpeakerStyle}
                    value={speakerStyle}
                    required
                    className="flex-1"
                    layout=""
                    labelStyle="block text-sm font-bold text-fg-basic"
                />
                <RadioBtnGroup
                    name="callInRoom"
                    label="방 안 통화 여부"
                    items={[
                        {item: "자유롭게", value:1},
                        {item: "이어폰", value:2},
                        {item: "나가서", value:3},
                    ]}
                    onChange={setCallInRoom}
                    value={callInRoom}
                    required
                    className="flex-1"
                    layout=""
                    labelStyle="block text-sm font-sans font-bold text-fg-basic"
                />
            </section>
            {errorMessage && <p className="mb-3 text-xs font-bold text-[#c04a67]" role="alert">{errorMessage}</p>}
            </div>
            <div className="shrink-0 bg-brand-background pt-3">
                <MoveBtnGroup
                    prev={getSurveyPath('/surveys/clean', isEditMode)}
                    onNext={handleNext}
                />
            </div>
        </main>
    );
}

export default SurveyLiving;
