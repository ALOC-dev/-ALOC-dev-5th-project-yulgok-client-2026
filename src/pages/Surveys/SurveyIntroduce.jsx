import { useState } from 'react'
import TextArea from './components/TextArea.jsx'
import ProgressBar from '../../components/ProgressBar.jsx'
import MoveBtnGroup from '../../components/MoveBtnGroup.jsx'
import MultipleBtnGroup from './components/MultipleBtnGroup.jsx';

function SurveyIntroduce() {
    const [visibleProfileFilelds, setVisibleProfileFields] = useState([]);

    return (
        <main className="relative min-h-dvh p-5 flex flex-col bg-brand-background pb-[calc(16px+env(safe-area-inset-bottom))]">
            <ProgressBar current={5}/>
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
                <TextArea 
                    label="자기소개"
                    placeholder="본인을 소개해주세요!"
                />
                <MultipleBtnGroup
                    label="중요하게 생각하는 항목"
                    value={visibleProfileFilelds}
                    items={[
                        {item: "취침 시간대", value:"BEDTIME"},
                        {item: "코골이", value:"SNORING"},
                        {item: "잠꼬대", value:"SLEEPTALKING"},
                        {item: "정리정돈수준", value:"ORGANIZINGSTYLE"},
                        {item: "샤워 빈도", value:"SHOWERFREQUENCY"},
                        {item: "흡연 여부", value:"SMOKINGSTATUS"},
                        {item: "방안 취식", value:"EATINGINROOM"},
                        {item: "실내 온도 선호", value:"TEMPERATUREPREFERENCE"},
                        {item: "음악·영상 감상 방식", value:"SPEAKERSTYLE"},
                        {item: "방안 통화 여부", value:"CALLINGINROOM"},
                    ]}
                    onChange={setVisibleProfileFields}
                />
            </section>
            <MoveBtnGroup
                next='/certification'
                prev='/surveys/living'
            />
        </main>
    );
}

export default SurveyIntroduce;
