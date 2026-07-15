import {useState} from 'react';
import ProgressBar from '../../components/ProgressBar';
import Slider from './components/Slider';
import RadioBtnGroup from '../../components/RadioBtnGroup';
import MoveBtnGroup from '../../components/MoveBtnGroup';

function SurveyClean() {
    const [organizingStyle, setOrganizingStyle] = useState(1);
    const [showerFrequency, setShowerFrequency] = useState(1);

    return(
        <main className="relative min-h-dvh p-5 flex flex-col bg-brand-background pb-[calc(16px+env(safe-area-inset-bottom))]">
            <ProgressBar current={3}/>
            <header className="flex flex-col my-6 gap-1">
                <p className="font-heading font-bold text-xs text-fg-secondary">
                    청결 · 위생
                </p>
                <h1 className="font-heading font-extrabold text-lg text-fg-primary">
                    청결과 정돈 습관
                </h1>
                <p className="font-heading text-xs text-fg-basic-muted">

                </p>
            </header>
            <section className="flex flex-col flex-1 gap-8">
                <Slider
                    range={5}
                    value={organizingStyle}
                    label="정리정돈 수준"
                    leftDescription="매우 깔끔"
                    rightDescription="어질러도 괜찮음"
                    onChange={setOrganizingStyle}
                />
                <RadioBtnGroup
                    name="showerFrequency"
                    label="샤워 빈도"
                    items={[
                        {item: "하루 2회 이상", value:1},
                        {item: "하루 1회", value:2},
                        {item: "이틀에 1회", value:3},
                        {item: "주 몇 회", value:4}
                    ]}
                    onChange={setShowerFrequency}
                    className="flex-1"
                    layout="grid grid-cols-2"
                    labelStyle="block text-sm font-sans font-bold text-fg-basic"
                />
            </section>
            <MoveBtnGroup
                next='/surveys/living'
                prev='/surveys/sleep'
            />
        </main>
    );
}

export default SurveyClean;