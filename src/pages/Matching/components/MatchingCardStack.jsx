import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMatchingErrorMessage, sendMatchingRequest } from '../../../api/matching/matching.js';
import MatchingCard from './MatchingCard.jsx';
import { CloseIcon, FilledHeartIcon, MatchingChatIcon } from './MatchingIcons.jsx';

const SWIPE_THRESHOLD = 65;

const ACTION_CONFIRMATION = {
  HEART: {
    title: '좋아요를 보낼까요?',
    description: '상대방에게 관심을 표현하고 매칭 가능성을 확인해요.',
    confirmLabel: '좋아요 보내기',
    direction: 1,
  },
  REJECT: {
    title: '이 추천을 넘길까요?',
    description: '넘긴 추천은 다시 보기 어려울 수 있어요.',
    confirmLabel: '추천 넘기기',
    direction: -1,
  },
};

function MatchingCardStack({ people, onStatusRefresh }) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [exitDirection, setExitDirection] = useState(0);
  const [pendingAction, setPendingAction] = useState('');
  const [actionError, setActionError] = useState('');
  const [confirmAction, setConfirmAction] = useState('');
  const dragStartX = useRef(null);

  const visiblePeople = people.map((_, offset) => people[(currentIndex + offset) % people.length]);

  useEffect(() => {
    if (!confirmAction) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') setConfirmAction('');
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [confirmAction]);

  const moveToNextCard = (direction = 1, onComplete) => {
    if (exitDirection) return;

    if (people.length < 2) {
      onComplete?.();
      return;
    }

    setExitDirection(direction);
    window.setTimeout(() => {
      setCurrentIndex((index) => (index + 1) % people.length);
      setDragX(0);
      setExitDirection(0);
      onComplete?.();
    }, 240);
  };

  const handlePointerDown = (event) => {
    if (exitDirection) return;
    if (event.target.closest('button')) return;
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

  const handleMatchingRequest = async (matchStatus, direction) => {
    if (pendingAction || exitDirection) return;

    const currentPerson = visiblePeople[0];
    if (!currentPerson?.userId) {
      setActionError('상대방 정보를 확인할 수 없어요.');
      return;
    }

    try {
      setPendingAction(matchStatus);
      setActionError('');
      await sendMatchingRequest(currentPerson.userId, matchStatus);
      moveToNextCard(direction, async () => {
        try {
          await onStatusRefresh?.();
        } catch (refreshError) {
          console.error('변경된 매칭 상태를 다시 불러오지 못했습니다.', refreshError);
          setActionError(
            getMatchingErrorMessage(refreshError, '요청은 반영됐지만 상태를 새로고침하지 못했어요.'),
          );
        }
      });
    } catch (error) {
      console.error('매칭 요청을 보내지 못했습니다.', error);
      setActionError(
        getMatchingErrorMessage(error, '요청을 보내지 못했어요. 잠시 후 다시 시도해 주세요.'),
      );
    } finally {
      setPendingAction('');
    }
  };

  const handleConfirmAction = () => {
    const confirmation = ACTION_CONFIRMATION[confirmAction];
    if (!confirmation) return;

    const selectedAction = confirmAction;
    setConfirmAction('');
    handleMatchingRequest(selectedAction, confirmation.direction);
  };

  return (
    <div className="w-full min-w-0 max-w-[clamp(20rem,52vw,28rem)]">
      <div
        className="relative touch-pan-y select-none pt-3"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        {visiblePeople.map((person, stackIndex) => {
          const isFront = stackIndex === 0;
          const backTransforms = [
            '',
            'translate(-3%, 11px) rotate(-4deg) scale(0.985)',
            'translate(3%, 17px) rotate(4deg) scale(0.965)',
          ];
          const frontX = exitDirection ? exitDirection * 460 : dragX;
          const transform = isFront
            ? `translateX(${frontX}px) rotate(${frontX / 24}deg)`
            : backTransforms[stackIndex] ?? backTransforms[2];

          return (
            <div
              key={person.userId ?? `${person.name}-${stackIndex}`}
              className={`${isFront ? 'relative' : 'pointer-events-none absolute inset-x-0 top-3'} ${
                !isDragging || exitDirection ? 'transition-transform duration-[240ms] ease-out' : ''
              }`}
              style={{
                zIndex: visiblePeople.length - stackIndex,
                transform,
                opacity: isFront ? 1 : Math.max(0.58, 0.88 - stackIndex * 0.13),
              }}
              aria-hidden={!isFront}
            >
              <MatchingCard person={person} isFront={isFront} />
            </div>
          );
        })}
      </div>

      <div
        className="mt-[clamp(1.5rem,8vw,2rem)] flex items-center justify-center gap-[clamp(0.75rem,5vw,1.25rem)]"
        aria-label="매칭 액션"
      >
        <button
          type="button"
          className="flex h-[clamp(3rem,9vw,4rem)] w-[clamp(3rem,9vw,4rem)] shrink-0 items-center justify-center rounded-full border border-[#dbe5f2] bg-white text-[#2858a5] shadow-[0_8px_22px_rgba(38,73,126,0.13)] transition-[transform,box-shadow,opacity] hover:shadow-[0_10px_25px_rgba(38,73,126,0.18)] active:scale-95 disabled:cursor-wait disabled:opacity-55"
          aria-label="이번 추천 넘기기"
          aria-busy={pendingAction === 'REJECT'}
          disabled={Boolean(pendingAction)}
          onClick={() => setConfirmAction('REJECT')}
        >
          <CloseIcon className={pendingAction === 'REJECT' ? 'animate-pulse' : ''} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="flex h-[clamp(3.75rem,11vw,5rem)] w-[clamp(3.75rem,11vw,5rem)] shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#4c83ce] to-[#2e62ad] text-[#ff668b] shadow-[0_12px_28px_rgba(45,98,176,0.31)] transition-[transform,box-shadow,opacity] hover:shadow-[0_14px_32px_rgba(45,98,176,0.36)] active:scale-95 disabled:cursor-wait disabled:opacity-55"
          aria-label="좋아요 보내기"
          aria-busy={pendingAction === 'HEART'}
          disabled={Boolean(pendingAction)}
          onClick={() => setConfirmAction('HEART')}
        >
          <FilledHeartIcon
            className={`h-6 w-6 ${pendingAction === 'HEART' ? 'animate-pulse' : ''}`}
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          className="flex h-[clamp(3rem,9vw,4rem)] w-[clamp(3rem,9vw,4rem)] shrink-0 items-center justify-center rounded-full border border-[#dbe5f2] bg-white text-[#2858a5] shadow-[0_8px_22px_rgba(38,73,126,0.13)] transition-[transform,box-shadow] hover:shadow-[0_10px_25px_rgba(38,73,126,0.18)] active:scale-95"
          aria-label="채팅으로 이동"
          onClick={() => navigate('/chat')}
        >
          <MatchingChatIcon aria-hidden="true" />
        </button>
      </div>

      <p
        className={`mt-3 min-h-5 text-center text-xs font-semibold text-[#c04a67] ${actionError ? 'visible' : 'invisible'}`}
        role="alert"
        aria-live="polite"
      >
        {actionError || '요청 처리 상태'}
      </p>

      {confirmAction && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-[#172238]/25 p-4 backdrop-blur-[2px] sm:items-center"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setConfirmAction('');
          }}
        >
          <div
            className="w-full max-w-[360px] rounded-[26px] bg-white p-[clamp(1.25rem,5vw,1.5rem)] shadow-[0_24px_60px_rgba(23,34,56,0.24)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="matching-confirm-title"
            aria-describedby="matching-confirm-description"
          >
            <h2 id="matching-confirm-title" className="text-lg font-extrabold text-fg-primary">
              {ACTION_CONFIRMATION[confirmAction].title}
            </h2>
            <p id="matching-confirm-description" className="mt-2 text-sm leading-6 text-fg-basic-muted">
              {ACTION_CONFIRMATION[confirmAction].description}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                className="min-h-11 rounded-full bg-[#edf2f8] px-4 text-sm font-extrabold text-fg-primary transition-transform active:scale-[0.98]"
                onClick={() => setConfirmAction('')}
              >
                취소
              </button>
              <button
                type="button"
                className={`min-h-11 rounded-full px-4 text-sm font-extrabold text-white transition-transform active:scale-[0.98] ${
                  confirmAction === 'HEART' ? 'bg-[#376db9]' : 'bg-[#6e7b92]'
                }`}
                onClick={handleConfirmAction}
              >
                {ACTION_CONFIRMATION[confirmAction].confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MatchingCardStack;
