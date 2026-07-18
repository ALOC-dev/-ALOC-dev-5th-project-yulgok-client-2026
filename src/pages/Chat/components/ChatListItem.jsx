function formatLastMessageTime(lastMessageTime) {
  const messageDate = new Date(lastMessageTime);

  if (Number.isNaN(messageDate.getTime())) return '';

  const now = new Date();
  const elapsedMilliseconds = now.getTime() - messageDate.getTime();
  const elapsedMinutes = Math.max(0, Math.floor(elapsedMilliseconds / 60000));

  if (elapsedMinutes < 1) return '방금';
  if (elapsedMinutes < 60) return `${elapsedMinutes}분 전`;

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
  const elapsedDays = Math.floor((today.getTime() - messageDay.getTime()) / 86400000);

  if (elapsedDays === 0) {
    return messageDate.toLocaleTimeString('ko-KR', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }
  if (elapsedDays === 1) return '어제';
  if (elapsedDays < 7) return messageDate.toLocaleDateString('ko-KR', { weekday: 'short' });

  return messageDate.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
}

function ChatListItem({
  partnerProfileImageUrl,
  partnerName,
  lastMessage,
  lastMessageTime,
  unreadCount,
  roomId,
  status,
}) {
  const navigate = useNavigate();

  return (
    <li data-room-id={roomId}>
      <button
        type="button"
        className="flex w-full items-center gap-3 border-b border-[#dce5f1] px-2 py-4 text-left transition-colors hover:bg-white/45 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-primary"
        aria-label={`${partnerName}님과의 채팅방${unreadCount > 0 ? `, 읽지 않은 메시지 ${unreadCount}개` : ''}`}
        onClick={() => navigate(`/chat/${roomId}`, {
          state: {
            room: {
              roomId,
              partnerProfileImageUrl,
              partnerName,
              lastMessage,
              lastMessageTime,
              unreadCount,
              status,
            },
          },
        })}
      >
        <div className="relative shrink-0">
          <img
            className="h-13 w-13 rounded-full bg-ui-sub object-cover"
            src={partnerProfileImageUrl}
            alt={`${partnerName} 프로필`}
          />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#1743a3] px-1 text-[11px] font-extrabold leading-none text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold text-fg-primary">{partnerName}</p>
          <p
            className={`mt-0.5 truncate text-xs ${unreadCount > 0 ? 'font-semibold text-fg-basic' : 'text-fg-basic-muted'}`}
          >
            {lastMessage}
          </p>
          {status === 'CLOSED' && <span className="mt-1 block text-[10px] font-semibold text-fg-basic-muted">종료된 채팅</span>}
        </div>

        <time className="shrink-0 self-start pt-1 text-[11px] text-fg-basic-muted" dateTime={lastMessageTime}>
          {formatLastMessageTime(lastMessageTime)}
        </time>
      </button>
    </li>
  );
}

export default ChatListItem;
import { useNavigate } from 'react-router-dom';
