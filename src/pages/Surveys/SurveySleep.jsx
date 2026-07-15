import { useState } from 'react';
import Slider from './components/Slider';
import ProgressBar from '../../components/ProgressBar';
import MoveBtnGroup from '../../components/MoveBtnGroup';

function SurveySleep() {
    const [bettime, setBettime] = useState(1);
    const [snoring, setSnoring] = useState(1);
    const [sleepTalking, setSleepTalking] = useState(1);

    return(
        <main className="relative min-h-dvh p-5 flex flex-col bg-brand-background pb-[calc(16px+env(safe-area-inset-bottom))]">
            <ProgressBar current={2}/>
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
                    value={bettime}
                    label="취침 시간대"
                    leftDescription="10시 이전"
                    rightDescription="새벽 1시 이후"
                    onChange={setBettime}
                />
                <Slider
                    range={5}
                    value={snoring}
                    label="코골이"
                    leftDescription="없음"
                    rightDescription="심함"
                    onChange={setSnoring}
                />
                <Slider
                    range={5}
                    value={sleepTalking}
                    label="잠꼬대"
                    leftDescription="없음"
                    rightDescription="심함"
                    onChange={setSleepTalking}
                />
            </section>
            <MoveBtnGroup
                next='/surveys/clean'
                prev='/user/details'
            />
        </main>
    );
}

export default SurveySleep;
