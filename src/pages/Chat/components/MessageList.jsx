import { Fragment, useEffect, useRef } from 'react';
import MessageItem from './MessageItem.jsx';

function getDateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function getMinuteKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${getDateKey(value)}-${date.getHours()}-${date.getMinutes()}`;
}

function formatMessageDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });
}

function MessageList({
  messages,
  currentUserId,
  partnerName,
  partnerProfileImageUrl,
  hasNext,
  isLoadingPrevious,
  onLoadPrevious,
}) {
  const bottomRef = useRef(null);
  const previousMessageCountRef = useRef(0);

  useEffect(() => {
    if (previousMessageCountRef.current === 0 && messages.length > 0) {
      bottomRef.current?.scrollIntoView({ block: 'end' });
    }
    previousMessageCountRef.current = messages.length;
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-5 text-center text-sm text-fg-basic-muted">
        아직 메시지가 없어요.<br />첫 메시지를 보내 대화를 시작해 보세요.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 px-5 pb-5" aria-label="메시지 목록">
      {hasNext && (
        <button
          type="button"
          className="mx-auto my-2 rounded-full bg-ui-sub px-4 py-2 text-xs font-semibold text-fg-primary disabled:opacity-60"
          disabled={isLoadingPrevious}
          onClick={onLoadPrevious}
        >
          {isLoadingPrevious ? '불러오는 중...' : '이전 메시지 불러오기'}
        </button>
      )}

      {messages.map((message, index) => {
        const previousMessage = messages[index - 1];
        const nextMessage = messages[index + 1];
        const isMine = String(message.senderId) === String(currentUserId);
        const showDate = !previousMessage || getDateKey(previousMessage.createdAt) !== getDateKey(message.createdAt);
        const showProfile = !isMine && (
          !previousMessage ||
          previousMessage.senderId !== message.senderId ||
          getMinuteKey(previousMessage.createdAt) !== getMinuteKey(message.createdAt)
        );
        const showTime = !nextMessage ||
          nextMessage.senderId !== message.senderId ||
          getMinuteKey(nextMessage.createdAt) !== getMinuteKey(message.createdAt);

        return (
          <Fragment key={message.messageId}>
            {showDate && (
              <time
                className="my-4 text-center text-[11px] font-medium text-[#9aa9be]"
                dateTime={message.createdAt}
              >
                {formatMessageDate(message.createdAt)}
              </time>
            )}
            <MessageItem
              message={message}
              isMine={isMine}
              showProfile={showProfile}
              showTime={showTime}
              partnerName={partnerName}
              partnerProfileImageUrl={partnerProfileImageUrl}
            />
          </Fragment>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}

export default MessageList;
