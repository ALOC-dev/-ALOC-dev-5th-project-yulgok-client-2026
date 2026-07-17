function ExeMatchBtn({ onExecute, isLoading }) {
  return (
    <button
      type="button"
      onClick={onExecute}
      disabled={isLoading}
      className="shrink-0 rounded-full bg-brand-primary px-4 py-2 text-xs font-bold text-white shadow-sm transition-[transform,opacity] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? '매칭 중...' : '새 매칭'}
    </button>
  );
}

export default ExeMatchBtn;
