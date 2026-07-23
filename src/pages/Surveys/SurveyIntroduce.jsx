import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import TextArea from './components/TextArea.jsx'
import ProgressBar from '../../components/ProgressBar.jsx'
import MoveBtnGroup from '../../components/MoveBtnGroup.jsx'
import MultipleBtnGroup from './components/MultipleBtnGroup.jsx';
import InlineInput from '../UserDetails/components/InlineInput.jsx';
import { generateRandomNickname } from './nicknameGenerator.js';
import {
    buildSurveyRequestBody,
    clearSurveyDraft,
    getFirstIncompleteSurveyPath,
    loadSurveyDraft,
    saveSurveyDraft,
} from './surveyDraft.js';
import { getSurveyErrorMessage, postSurveys } from '../../api/surveys/surveys.js';
import { changeNickname } from '../../api/users/users.js';
import { useAuth } from '../../auth/AuthContext.jsx';

function SurveyIntroduce() {
    const navigate = useNavigate();
    const { refreshCurrentUser } = useAuth();
    const [nickname, setNickname] = useState('');
    const [introduce, setIntroduce] = useState(() => loadSurveyDraft().introduce ?? '');
    const [visibleProfileFields, setVisibleProfileFields] = useState(() => loadSurveyDraft().visibleProfileFields ?? []);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        saveSurveyDraft({ introduce, visibleProfileFields });
    }, [introduce, visibleProfileFields]);

    async function handleNext() {
        if (isSubmitting) return;

        if (!nickname.trim()) {
            setErrorMessage('닉네임을 입력해주세요.');
            return;
        }
        if (nickname.trim().length > 8) {
            setErrorMessage('닉네임은 8자 이하로 입력해주세요.');
            return;
        }
        if (!introduce.trim()) {
            setErrorMessage('자기소개를 입력해주세요.');
            return;
        }
        if (introduce.trim().length > 200) {
            setErrorMessage('자기소개는 200자 이하로 입력해주세요.');
            return;
        }
        if (visibleProfileFields.length < 1) {
            setErrorMessage('중요하게 생각하는 항목을 최소 1개 선택해주세요.');
            return;
        }

        const draft = saveSurveyDraft({ introduce: introduce.trim(), visibleProfileFields });
        const incompletePagePath = getFirstIncompleteSurveyPath(draft);

        if (incompletePagePath) {
            setErrorMessage('입력하지 않은 설문 항목이 있어요. 해당 페이지로 이동합니다.');
            navigate(incompletePagePath);
            return;
        }

        const requestBody = buildSurveyRequestBody(draft);

        try {
            setIsSubmitting(true);
            setErrorMessage('');
            await changeNickname(nickname.trim());
            await postSurveys(requestBody);
            await refreshCurrentUser();
            clearSurveyDraft();
            navigate('/certification');
        } catch (error) {
            console.error('설문 제출에 실패했습니다.', error);
            setErrorMessage(getSurveyErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="flex h-dvh flex-col overflow-hidden bg-brand-background p-5 pb-[calc(16px+env(safe-area-inset-bottom))]">
            <ProgressBar current={5}/>
            <div
                data-survey-scroll-region
                className="min-h-0 flex-1 overflow-y-auto pb-4"
            >
            <header className="flex flex-col my-6 gap-1">
                <p className="font-heading font-bold text-xs text-fg-secondary">
                    
                </p>
                <h1 className="font-heading font-extrabold text-lg text-fg-primary">
                    나는 이런 사람이에요.
                </h1>
                <p className="font-heading text-xs text-fg-basic-muted">

                </p>
            </header>
            <section className="flex flex-col flex-1 gap-8">
                <div className="flex items-end gap-2">
                    <div className="w-40">
                        <InlineInput
                            name="nickname"
                            label="닉네임"
                            type="text"
                            value={nickname}
                            placeholder="닉네임 입력"
                            autoComplete="nickname"
                            maxLength={8}
                            labelStyle="block text-sm font-sans font-bold text-fg-basic"
                            inputStyle="h-[37px] !py-0"
                            onChange={setNickname}
                        />
                    </div>
                    <button
                        type="button"
                        className="flex h-[37px] w-[46px] shrink-0 items-center justify-center rounded-input bg-white text-xl shadow-sm transition-colors hover:bg-ui-sub focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                        aria-label="무작위 닉네임 생성"
                        onClick={() => setNickname(generateRandomNickname())}
                    >
                        🎲
                    </button>
                </div>
                <TextArea
                    label="자기소개"
                    placeholder="본인을 소개해주세요!"
                    value={introduce}
                    onChange={setIntroduce}
                    required
                    maxLength={500}
                />
                <MultipleBtnGroup
                    label="중요하게 생각하는 항목"
                    value={visibleProfileFields}
                    items={[
                        {item: "취침 시간대", value:"BEDTIME"},
                        {item: "코골이", value:"SNORING"},
                        {item: "잠꼬대", value:"SLEEP_TALKING"},
                        {item: "정리정돈수준", value:"ORGANIZING_STYLE"},
                        {item: "샤워 빈도", value:"SHOWER_FREQUENCY"},
                        {item: "방안 취식", value:"EATING_IN_ROOM"},
                        {item: "실내 온도 선호", value:"TEMPERATURE_PREFERENCE"},
                        {item: "음악·영상 감상 방식", value:"SPEAKER_STYLE"},
                        {item: "방안 통화 여부", value:"CALL_IN_ROOM"},
                    ]}
                    onChange={setVisibleProfileFields}
                    required
                />
            </section>
            {errorMessage && (
                <p className="mb-3 text-xs font-bold text-[#c04a67]" role="alert">
                    {errorMessage}
                </p>
            )}
            </div>
            <div className="shrink-0 bg-brand-background pt-3">
                <MoveBtnGroup
                    prev='/surveys/living'
                    onNext={handleNext}
                    nextDisabled={isSubmitting}
                    nextLabel={isSubmitting ? '제출 중...' : '다음'}
                />
            </div>
        </main>
    );
}

export default SurveyIntroduce;
