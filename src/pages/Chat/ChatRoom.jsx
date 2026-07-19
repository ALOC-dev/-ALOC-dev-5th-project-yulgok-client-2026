import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import {
  getChatErrorMessage,
  getChatMessages,
  getChatRooms,
  markChatMessagesAsRead,
} from '../../api/chat/chat.js';
import {
  parseStompBody,
  publishChatMessage,
} from '../../api/chat/chatSocket.js';
import { useChatSocket } from './ChatSocketContext.jsx';
import ChatRoomHeader from './components/ChatRoomHeader.jsx';
import MessageInput from './components/MessageInput.jsx';
import MessageList from './components/MessageList.jsx';

function sortMessages(messages) {
  return [...messages].sort((messageA, messageB) => {
    const timeDifference = Date.parse(messageA.createdAt) - Date.parse(messageB.createdAt);
    return timeDifference || Number(messageA.messageId) - Number(messageB.messageId);
  });
}

function areMessagesEqual(messageA, messageB) {
  return (
    messageA?.messageId === messageB?.messageId &&
    messageA?.senderId === messageB?.senderId &&
    messageA?.message === messageB?.message &&
    messageA?.createdAt === messageB?.createdAt &&
    Boolean(messageA?.isRead) === Boolean(messageB?.isRead)
  );
}

function areMessageListsEqual(messagesA, messagesB) {
  return messagesA.length === messagesB.length &&
    messagesA.every((message, index) => areMessagesEqual(message, messagesB[index]));
}

function mergeMessages(currentMessages, incomingMessages) {
  const messageMap = new Map(
    [...currentMessages, ...incomingMessages]
      .filter((message) => message?.messageId != null)
      .map((message) => [message.messageId, message]),
  );

  const mergedMessages = sortMessages([...messageMap.values()]);
  return areMessageListsEqual(currentMessages, mergedMessages) ? currentMessages : mergedMessages;
}

function markIncomingMessagesAsRead(messages, currentUserId) {
  const updatedMessages = messages.map((message) => {
    if (String(message.senderId) === String(currentUserId) || message.isRead) {
      return message;
    }

    return {
      ...message,
      isRead: true,
    };
  });

  return areMessageListsEqual(messages, updatedMessages) ? messages : updatedMessages;
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
  const { client, currentUserId, isConnected, refreshTotalUnreadCount } = useChatSocket();

  const [room, setRoom] = useState(passedRoom);
  const [messages, setMessages] = useState([]);
  const [hasNext, setHasNext] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPrevious, setIsLoadingPrevious] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sendNotice, setSendNotice] = useState('');

  const readTimerRef = useRef(null);

  const markRoomAsReadSoon = useCallback(() => {
    if (!currentUserId) return;

    window.clearTimeout(readTimerRef.current);
    readTimerRef.current = window.setTimeout(() => {
      markChatMessagesAsRead(roomId)
        .then(() => {
          setMessages((currentMessages) => markIncomingMessagesAsRead(currentMessages, currentUserId));
          return refreshTotalUnreadCount();
        })
        .catch((error) => {
          console.info('메시지 읽음 처리를 완료하지 못했습니다.', error);
        });
    }, 500);
  }, [currentUserId, refreshTotalUnreadCount, roomId]);

  const syncLatestMessages = useCallback(async () => {
    const result = await getChatMessages(roomId);

    setMessages((currentMessages) => mergeMessages(currentMessages, result.messages));
    setHasNext((currentHasNext) => currentHasNext || result.hasNext);

    if (result.messages.some((message) => String(message.senderId) !== String(currentUserId) && !message.isRead)) {
      markRoomAsReadSoon();
    }
  }, [currentUserId, markRoomAsReadSoon, roomId]);

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

        const [loadedRoom, messageResult] = await Promise.all([
          roomRequest,
          getChatMessages(roomId),
        ]);

        if (!isMounted) return;
        if (!loadedRoom) throw new Error('CHAT_ROOM_NOT_FOUND');

        setRoom(loadedRoom);
        setMessages(sortMessages(messageResult.messages));
        setHasNext(messageResult.hasNext);
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

  useEffect(() => {
    if (!room || !currentUserId) return;
    markRoomAsReadSoon();
  }, [currentUserId, markRoomAsReadSoon, room]);

  useEffect(() => {
    if (!client || !isConnected || !room || !currentUserId) return undefined;

    const syncTimer = window.setTimeout(() => {
      syncLatestMessages().catch((error) => {
        console.info('재연결 후 최신 메시지 동기화를 완료하지 못했습니다.', error);
      });
    }, 0);

    const roomSubscription = client.subscribe(`/topic/room/${roomId}`, (message) => {
      const payload = parseStompBody(message);
      if (!payload) return;

      setMessages((currentMessages) => mergeMessages(currentMessages, [payload]));

      if (payload.senderId !== currentUserId) {
        markRoomAsReadSoon();
      }
    });

    return () => {
      window.clearTimeout(syncTimer);
      roomSubscription.unsubscribe();
    };
  }, [client, currentUserId, isConnected, markRoomAsReadSoon, room, roomId, syncLatestMessages]);

  useEffect(() => {
    if (!isConnected || !room || !currentUserId) return undefined;

    const readStatusSyncTimer = window.setInterval(() => {
      syncLatestMessages().catch((error) => {
        console.info('메시지 읽음 상태를 동기화하지 못했습니다.', error);
      });
    }, 3000);

    return () => {
      window.clearInterval(readStatusSyncTimer);
    };
  }, [currentUserId, isConnected, room, syncLatestMessages]);

  useEffect(() => {
    return () => {
      window.clearTimeout(readTimerRef.current);
    };
  }, []);

  const handleLoadPrevious = useCallback(async () => {
    if (isLoadingPrevious || !hasNext || messages.length === 0) return;

    try {
      setIsLoadingPrevious(true);
      const oldestMessageId = messages[0].messageId;
      const result = await getChatMessages(roomId, { cursor: oldestMessageId });

      setMessages((currentMessages) => mergeMessages(currentMessages, result.messages));
      setHasNext(result.hasNext);
    } catch (error) {
      console.error('이전 메시지를 불러오지 못했습니다.', error);
      setErrorMessage(getChatErrorMessage(error, '이전 메시지를 불러오지 못했어요.'));
    } finally {
      setIsLoadingPrevious(false);
    }
  }, [hasNext, isLoadingPrevious, messages, roomId]);

  const handleSend = useCallback((message) => {
    if (!client?.connected) {
      setSendNotice('실시간 채팅 서버에 연결 중이에요. 잠시 후 다시 보내주세요.');
      return;
    }

    try {
      publishChatMessage(client, { roomId, message });
      setSendNotice('');
    } catch (error) {
      console.error('메시지를 전송하지 못했습니다.', error);
      setSendNotice('메시지를 전송하지 못했어요.');
    }
  }, [client, roomId]);

  const matchInformation = useMemo(() => {
    if (!room?.matchedAt) return '';
    const percentage = room.matchPercentage != null ? ` · ${room.matchPercentage}% 일치` : '';
    return `${formatMatchedDate(room.matchedAt)}에 서로 매칭되었어요${percentage}`;
  }, [room]);

  const isInputDisabled = room?.status === 'CLOSED' || !isConnected;

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
      <MessageInput
        disabled={isInputDisabled}
        disabledReason={room.status === 'CLOSED' ? '종료된 채팅방입니다.' : '채팅 서버에 연결 중이에요.'}
        onSend={handleSend}
      />
    </section>
  );
}

export default ChatRoom;
