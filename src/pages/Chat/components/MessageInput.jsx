import { useState } from 'react';

const maxMessageLength = 500;

function MessageInput({ disabled = false, disabledReason = '메시지를 보낼 수 없어요.', onSend }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;

    onSend(trimmedMessage);
    setMessage('');
  };

  return (
    <form
      className="flex items-center gap-2 border-t border-[#dce5f1] bg-white px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]"
      onSubmit={handleSubmit}
    >
      <button
        type="button"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ui-sub text-white disabled:opacity-50"
        disabled={disabled}
        aria-label="파일 첨부"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <label className="sr-only" htmlFor="chat-message-input">메시지</label>
      <input
        id="chat-message-input"
        className="min-w-0 flex-1 rounded-full bg-ui-sub px-4 py-2.5 text-sm text-fg-basic outline-none placeholder:text-[#91a0b6] focus:ring-2 focus:ring-brand-primary/25 disabled:opacity-60"
        value={message}
        disabled={disabled}
        maxLength={maxMessageLength}
        placeholder={disabled ? disabledReason : '메시지를 입력하세요...'}
        autoComplete="off"
        onChange={(event) => setMessage(event.target.value)}
      />

      <button
        type="submit"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1743a3] text-white transition-opacity disabled:opacity-40"
        disabled={disabled || !message.trim()}
        aria-label="메시지 전송"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="m21 3-7.5 18-3.2-7.3L3 10.5 21 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="m10.3 13.7 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </form>
  );
}

export default MessageInput;
