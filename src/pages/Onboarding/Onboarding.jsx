import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    icon: '👋',
    title: <>이룸매이트에 오신 것을 환영합니다!</>,
    description: <>기숙사 생활을 더욱 즐겁고 편안하게 만들어 줄<br />최적의 룸메이트를 찾아드립니다.</>,
  },
  {
    icon: '📝',
    title: <>프로필 입력 기간 동안<br />룸메이트를 모집해요</>,
    description: <>나의 생활 습관과 성향을 자세히 기록하고<br />매칭을 위한 정보를 입력해주세요.</>,
  },
  {
    icon: '❤️',
    title: <>매칭 기간에 추천 룸메이트를<br />만나보세요</>,
    description: <>입력된 정보를 바탕으로 나와 잘 맞는 룸메이트를 추천해 드려요.<br />간략한 소개를 보고 마음에 드는 룸메이트에게 하트를 보내세요!</>,
  },
  {
    icon: '💬',
    title: <>하트가 통하면<br />채팅방이 열려요</>,
    description: <>서로 하트를 보내 쌍방향 매칭이 이루어지면<br />채팅방이 열리고 세부적인 내용을 조율할 수 있습니다.</>,
  },
  {
    icon: '🤝',
    title: <>최종 룸메이트를<br />결정하세요</>,
    description: <>채팅을 통해 충분히 대화하고<br />최고의 룸메이트를 찾아보세요!</>,
  },
];

function Onboarding() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const isLastSlide = currentSlide === slides.length - 1;

  const finishOnboarding = () => navigate('/user/details', { replace: true });

  return (
    <main className="grid min-h-dvh place-items-center bg-brand-background p-4">
      <section className="relative flex h-[min(650px,calc(100dvh-32px))] w-full max-w-[420px] flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div
          className="flex min-h-0 flex-1 transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <article
              className="flex w-full shrink-0 flex-col items-center justify-center px-6 pb-28 text-center"
              key={index}
              aria-hidden={index !== currentSlide}
            >
              <div className="mb-8 flex h-[180px] w-[180px] items-center justify-center rounded-full bg-[#E0F2F7] text-[44px]">
                {slide.icon}
              </div>
              <h1 className="mb-4 text-2xl font-bold leading-snug text-[#1A202C]">
                {slide.title}
              </h1>
              <p className="text-[15px] leading-relaxed text-[#718096]">
                {slide.description}
              </p>
            </article>
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-[100px] z-10 flex justify-center gap-2" aria-label={`${currentSlide + 1} / ${slides.length}`}>
          {slides.map((_, index) => (
            <span
              key={index}
              className={`h-2 rounded-full transition-all ${index === currentSlide ? 'w-5 bg-[#3498DB]' : 'w-2 bg-[#CBD5E1]'}`}
            />
          ))}
        </div>

        <footer className="absolute inset-x-0 bottom-0 z-10 flex gap-3 border-t border-[#F1F5F9] bg-white px-6 py-5">
          <button
            type="button"
            className="h-14 flex-1 rounded-2xl bg-[#F1F5F9] text-base font-bold text-[#64748B] transition active:scale-95"
            onClick={finishOnboarding}
          >
            건너뛰기
          </button>
          <button
            type="button"
            className="h-14 flex-1 rounded-2xl bg-[#3498DB] text-base font-bold text-white shadow-lg shadow-[#3498DB]/20 transition hover:bg-[#2980B9] active:scale-95"
            onClick={isLastSlide ? finishOnboarding : () => setCurrentSlide((current) => current + 1)}
          >
            {isLastSlide ? '시작하기' : '다음'}
          </button>
        </footer>
      </section>
    </main>
  );
}

export default Onboarding;
