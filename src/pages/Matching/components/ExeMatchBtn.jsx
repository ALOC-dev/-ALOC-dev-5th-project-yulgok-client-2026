import { RefreshIcon } from './MatchingIcons.jsx';

function ExeMatchBtn({ onExecute, isLoading }) {
  return (
    <button
      type="button"
      onClick={onExecute}
      disabled={isLoading}
      aria-label={isLoading ? '오늘의 매칭 진행 중' : '오늘의 매칭 실행'}
      className="group flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 rounded-full border border-white/80 bg-white px-[clamp(0.75rem,3.5vw,0.875rem)] text-xs font-extrabold text-fg-primary shadow-[0_7px_18px_rgba(42,76,129,0.12)] transition-[transform,box-shadow,opacity] hover:shadow-[0_9px_22px_rgba(42,76,129,0.17)] active:scale-95 disabled:cursor-wait disabled:opacity-65"
    >
      <RefreshIcon
        className={`h-[clamp(1rem,4.5vw,1.125rem)] w-[clamp(1rem,4.5vw,1.125rem)] shrink-0 text-[#467ac5] ${isLoading ? 'animate-spin' : 'transition-transform group-hover:rotate-45'}`}
        aria-hidden="true"
      />
      <span className={isLoading ? 'sr-only' : 'max-[340px]:sr-only'}>
        {isLoading ? '오늘의 매칭 진행 중' : '오늘의 매칭'}
      </span>
    </button>
  );
}

export default ExeMatchBtn;
