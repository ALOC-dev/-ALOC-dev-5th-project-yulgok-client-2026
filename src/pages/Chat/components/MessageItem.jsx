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

function formatMessageTime(createdAt) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function MessageItem({
  message,
  isMine,
  showProfile,
  showTime,
  partnerName,
  partnerProfileImageUrl,
}) {
  const profileImageUrl = isValidProfileImageUrl(partnerProfileImageUrl)
    ? partnerProfileImageUrl
    : fallbackProfileImageUrl;
  const showUnreadMark = isMine && !message.isRead;
  const showMineMeta = isMine && (showUnreadMark || showTime);

  return (
    <div className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
      {!isMine && (
        <div className="w-8 shrink-0 self-start">
          {showProfile && (
            <img
              className="h-8 w-8 rounded-full bg-ui-sub object-cover"
              src={profileImageUrl}
              alt={`${partnerName} 프로필`}
              onError={(event) => {
                event.currentTarget.src = fallbackProfileImageUrl;
              }}
            />
          )}
        </div>
      )}

      {showMineMeta && (
        <div className="flex shrink-0 flex-col items-end text-[10px] leading-4 text-fg-basic-muted">
          {showUnreadMark && <span className="font-bold text-[#d39b18]">1</span>}
          {showTime && <time dateTime={message.createdAt}>{formatMessageTime(message.createdAt)}</time>}
        </div>
      )}

      <p
        className={`max-w-[72%] whitespace-pre-wrap break-words px-4 py-2.5 text-sm leading-5 shadow-sm ${
          isMine
            ? 'rounded-[18px] rounded-br-[5px] bg-[#173fa8] text-white'
            : 'rounded-[18px] rounded-bl-[5px] bg-white text-fg-basic'
        }`}
      >
        {message.message}
      </p>

      {!isMine && showTime && (
        <time className="shrink-0 text-[10px] text-fg-basic-muted" dateTime={message.createdAt}>
          {formatMessageTime(message.createdAt)}
        </time>
      )}
    </div>
  );
}

export default MessageItem;
