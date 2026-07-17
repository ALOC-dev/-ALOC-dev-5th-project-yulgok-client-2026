import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MatchingCard from './MatchingCard.jsx';
import { CloseIcon, FilledHeartIcon, MatchingChatIcon } from './MatchingIcons.jsx';

const SWIPE_THRESHOLD = 65;

function MatchingCardStack({ people }) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [exitDirection, setExitDirection] = useState(0);
  const dragStartX = useRef(null);

  // 현재 추천부터 순환하도록 배열을 재정렬해 세 장을 항상 같은 스택 구조로 그림.
  const visiblePeople = people.map((_, offset) => people[(currentIndex + offset) % people.length]);

  const moveToNextCard = (direction = 1) => {
    if (exitDirection || people.length < 2) return;

    setExitDirection(direction);
    window.setTimeout(() => {
      setCurrentIndex((index) => (index + 1) % people.length);
      setDragX(0);
      setExitDirection(0);
    }, 240);
  };

  const handlePointerDown = (event) => {
    if (exitDirection) return;
    dragStartX.current = event.clientX;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (dragStartX.current === null || exitDirection) return;
    setDragX(event.clientX - dragStartX.current);
  };

  const handlePointerEnd = () => {
    if (dragStartX.current === null) return;
    dragStartX.current = null;
    setIsDragging(false);

    if (Math.abs(dragX) >= SWIPE_THRESHOLD) {
      moveToNextCard(dragX > 0 ? 1 : -1);
    } else {
      setDragX(0);
    }
  };

  return (
    <div className="w-full max-w-[360px]">
      <div
        className="relative touch-pan-y select-none pt-4"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        {visiblePeople.map((person, stackIndex) => {
          const isFront = stackIndex === 0;
          const backTransforms = [
            '',
            'translate(-12px, 12px) rotate(-4deg) scale(0.98)',
            'translate(12px, 18px) rotate(4deg) scale(0.96)',
          ];
          const frontX = exitDirection ? exitDirection * 460 : dragX;
          const transform = isFront
            ? `translateX(${frontX}px) rotate(${frontX / 24}deg)`
            : backTransforms[stackIndex] ?? backTransforms[2];

          return (
            <div
              key={person.userId ?? `${person.name}-${stackIndex}`}
              className={`${isFront ? 'relative' : 'pointer-events-none absolute inset-x-0 top-4'} ${
                !isDragging || exitDirection ? 'transition-transform duration-[240ms] ease-out' : ''
              }`}
              style={{
                zIndex: visiblePeople.length - stackIndex,
                transform,
                opacity: isFront ? 1 : Math.max(0.55, 0.86 - stackIndex * 0.12),
              }}
              aria-hidden={!isFront}
            >
              <MatchingCard person={person} isFront={isFront} />
            </div>
          );
        })}
      </div>

      {/* 카드 선택 액션: X와 하트는 다음 추천으로, 채팅은 채팅 페이지로 이동 */}
      <div className="mt-8 flex items-center justify-center gap-5" aria-label="매칭 액션">
        <button
          type="button"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#2858a5] shadow-[0_8px_24px_rgba(38,73,126,0.13)] transition-transform active:scale-95"
          aria-label="이번 추천 넘기기"
          onClick={() => moveToNextCard(-1)}
        >
          <CloseIcon aria-hidden="true" />
        </button>
        <button
          type="button"
          className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gradient-to-b from-[#4d86d4] to-[#2c61ae] text-[#ff668b] shadow-[0_10px_26px_rgba(45,98,176,0.3)] transition-transform active:scale-95"
          aria-label="좋아요 보내기"
          onClick={() => moveToNextCard(1)}
        >
          <FilledHeartIcon className="h-6 w-6" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#2858a5] shadow-[0_8px_24px_rgba(38,73,126,0.13)] transition-transform active:scale-95"
          aria-label="채팅으로 이동"
          onClick={() => navigate('/chat')}
        >
          <MatchingChatIcon aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default MatchingCardStack;
