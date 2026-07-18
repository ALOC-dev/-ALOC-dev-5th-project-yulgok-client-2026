import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { getCurrentUserId } from '../../api/auth/authStatus.js';
import {
  getChatErrorMessage,
  getChatMessages,
  getChatRooms,
  markChatMessagesAsRead,
} from '../../api/chat/chat.js';
import ChatRoomHeader from './components/ChatRoomHeader.jsx';
import MessageInput from './components/MessageInput.jsx';
import MessageList from './components/MessageList.jsx';

function sortMessages(messages) {
  return [...messages].sort((messageA, messageB) => {
    const timeDifference = Date.parse(messageA.createdAt) - Date.parse(messageB.createdAt);
    return timeDifference || Number(messageA.messageId) - Number(messageB.messageId);
  });
}

function formatMatchedDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}

function ChatRoom() {
  const { roomId: roomIdParam } = useParams();
  const location = useLocation();
  const roomId = Number(roomIdParam);
  const passedRoom = location.state?.room?.roomId === roomId ? location.state.room : null;

  const [room, setRoom] = useState(passedRoom);
  const [messages, setMessages] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPrevious, setIsLoadingPrevious] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sendNotice, setSendNotice] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadChatRoom() {
      if (!Number.isInteger(roomId) || roomId <= 0) {
        setErrorMessage('올바르지 않은 채팅방이에요.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage('');

        const roomRequest = passedRoom
          ? Promise.resolve(passedRoom)
          : getChatRooms().then((rooms) => rooms.find((item) => item.roomId === roomId) ?? null);

        const [loadedRoom, messageResult, userId] = await Promise.all([
          roomRequest,
          getChatMessages(roomId),
          getCurrentUserId(),
        ]);

        if (!isMounted) return;
        if (!loadedRoom) throw new Error('CHAT_ROOM_NOT_FOUND');

        setRoom(loadedRoom);
        setMessages(sortMessages(messageResult.messages));
        setHasNext(messageResult.hasNext);
        setCurrentUserId(userId);

        markChatMessagesAsRead(roomId).catch((error) => {
          console.info('메시지 읽음 처리를 완료하지 못했습니다.', error);
        });
      } catch (error) {
        console.error('채팅방을 불러오지 못했습니다.', error);
        if (isMounted) {
          setErrorMessage(
            error?.message === 'CHAT_ROOM_NOT_FOUND'
              ? '채팅방을 찾을 수 없어요.'
              : getChatErrorMessage(error),
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadChatRoom();
    return () => {
      isMounted = false;
    };
  }, [passedRoom, roomId]);

  const handleLoadPrevious = useCallback(async () => {
    if (isLoadingPrevious || !hasNext || messages.length === 0) return;

    try {
      setIsLoadingPrevious(true);
      const oldestMessageId = messages[0].messageId;
      const result = await getChatMessages(roomId, { cursor: oldestMessageId });

      setMessages((currentMessages) => {
        const messageMap = new Map(
          [...result.messages, ...currentMessages].map((message) => [message.messageId, message]),
        );
        return sortMessages([...messageMap.values()]);
      });
      setHasNext(result.hasNext);
    } catch (error) {
      console.error('이전 메시지를 불러오지 못했습니다.', error);
      setErrorMessage(getChatErrorMessage(error, '이전 메시지를 불러오지 못했어요.'));
    } finally {
      setIsLoadingPrevious(false);
    }
  }, [hasNext, isLoadingPrevious, messages, roomId]);

  const handleSend = () => {
    // Swagger에 메시지 전송 API가 추가되면 이 경계에서 REST 또는 WebSocket 전송을 연결합니다.
    setSendNotice('메시지 전송 기능은 서버 API 연결 후 사용할 수 있어요.');
  };

  const matchInformation = useMemo(() => {
    if (!room?.matchedAt) return '';
    const percentage = room.matchPercentage != null ? ` · ${room.matchPercentage}% 일치` : '';
    return `${formatMatchedDate(room.matchedAt)}에 서로 매칭했어요${percentage}`;
  }, [room]);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-brand-background text-sm font-semibold text-fg-basic-muted" role="status">
        대화를 불러오는 중이에요...
      </div>
    );
  }

  if (errorMessage && !room) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-brand-background px-5 text-center">
        <p className="text-sm text-fg-basic-muted" role="alert">{errorMessage}</p>
        <button type="button" className="rounded-full bg-brand-primary px-5 py-2 text-sm font-bold text-white" onClick={() => window.location.reload()}>
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <section className="flex h-dvh flex-col overflow-hidden bg-brand-background">
      <ChatRoomHeader
        partnerName={room.partnerName}
        partnerProfileImageUrl={room.partnerProfileImageUrl}
        roomStatus={room.status}
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        {matchInformation && (
          <div className="mx-5 mt-4 rounded-[18px] border border-[#d9e3f0] bg-white/30 px-4 py-3 text-xs font-semibold text-fg-primary">
            <span className="mr-2 text-[#ef4d83]" aria-hidden="true">♥</span>
            {matchInformation}
          </div>
        )}

        {errorMessage && (
          <p className="mx-5 mt-3 rounded-xl bg-red-50 px-4 py-2 text-center text-xs text-red-700" role="alert">
            {errorMessage}
          </p>
        )}

        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          partnerName={room.partnerName}
          partnerProfileImageUrl={room.partnerProfileImageUrl}
          hasNext={hasNext}
          isLoadingPrevious={isLoadingPrevious}
          onLoadPrevious={handleLoadPrevious}
        />
      </div>

      {sendNotice && (
        <p className="bg-white px-4 pt-2 text-center text-[11px] text-fg-basic-muted" role="status">
          {sendNotice}
        </p>
      )}
      <MessageInput disabled={room.status === 'CLOSED'} onSend={handleSend} />
    </section>
  );
}

export default ChatRoom;
