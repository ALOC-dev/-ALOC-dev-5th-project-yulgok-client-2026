import { useNavigate } from 'react-router-dom';

const fallbackProfileImageUrl = '/favicon.svg';

function isValidProfileImageUrl(profileImageUrl) {
  if (!profileImageUrl || profileImageUrl === 'string') return false;

  try {
    const url = new URL(profileImageUrl, window.location.origin);
    return url.protocol === 'http:' || url.protocol === 'https:' || url.pathname.startsWith('/');
  } catch {
    return false;
  }
}

function getRoomStatusLabel(roomStatus, matchStatus, confirmedByMe, canConfirm) {
  if (matchStatus === 'CONFIRM_PENDING' && confirmedByMe === true && canConfirm !== true) return '확정 대기';
  if (
    matchStatus === 'FINAL_CONFIRMED' ||
    matchStatus === 'CLOSED' ||
    matchStatus === 'REJECTED_BY_OTHER' ||
    roomStatus === 'CLOSED'
  ) return '종료된 채팅';
  return '채팅 중';
}

function ChatRoomHeader({
  partnerName,
  partnerProfileImageUrl,
  roomStatus,
  matchStatus,
  confirmedByMe,
  canConfirm,
  onFinalConfirm,
  onReject,
}) {
  const navigate = useNavigate();
  const profileImageUrl = isValidProfileImageUrl(partnerProfileImageUrl)
    ? partnerProfileImageUrl
    : fallbackProfileImageUrl;
  const statusLabel = getRoomStatusLabel(roomStatus, matchStatus, confirmedByMe, canConfirm);

  return (
    <header className="flex min-h-18 items-center gap-3 border-b border-[#dce5f1] bg-brand-background px-5 py-3">
      <button
        type="button"
        className="-ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-fg-primary transition-colors hover:bg-ui-sub"
        onClick={() => navigate(-1)}
        aria-label="채팅 목록으로 돌아가기"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <img
        className="h-10 w-10 shrink-0 rounded-full bg-ui-sub object-cover"
        src={profileImageUrl}
        alt={`${partnerName} 프로필`}
        onError={(event) => {
          event.currentTarget.src = fallbackProfileImageUrl;
        }}
      />

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <h1 className="truncate text-sm font-extrabold text-fg-primary">{partnerName}</h1>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold text-white ${
            statusLabel === '채팅 중' ? 'bg-[#7c32df]' : 'bg-fg-basic-muted'
          }`}
        >
          {statusLabel}
        </span>
      </div>

      {(onReject || onFinalConfirm) && (
        <div className="flex shrink-0 items-center gap-1.5">
          {onReject && (
            <button
              type="button"
              className="min-h-9 rounded-full bg-[#edf2f8] px-3 text-xs font-extrabold text-[#9f2847] shadow-sm transition-transform active:scale-95"
              onClick={onReject}
            >
              거절
            </button>
          )}
          {onFinalConfirm && (
            <button
              type="button"
              className="min-h-9 rounded-full bg-brand-primary px-3 text-xs font-extrabold text-white shadow-sm transition-transform active:scale-95"
              onClick={onFinalConfirm}
            >
              최종확정
            </button>
          )}
        </div>
      )}

    </header>
  );
}

export default ChatRoomHeader;
