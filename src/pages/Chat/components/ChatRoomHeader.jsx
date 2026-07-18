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

function ChatRoomHeader({ partnerName, partnerProfileImageUrl, roomStatus }) {
  const navigate = useNavigate();
  const profileImageUrl = isValidProfileImageUrl(partnerProfileImageUrl)
    ? partnerProfileImageUrl
    : fallbackProfileImageUrl;

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
            roomStatus === 'CLOSED' ? 'bg-fg-basic-muted' : 'bg-[#7c32df]'
          }`}
        >
          {roomStatus === 'CLOSED' ? '종료된 채팅' : '채팅 중'}
        </span>
      </div>

      <button
        type="button"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-fg-basic-muted transition-colors hover:bg-ui-sub"
        aria-label="채팅방 메뉴"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>
    </header>
  );
}

export default ChatRoomHeader;
