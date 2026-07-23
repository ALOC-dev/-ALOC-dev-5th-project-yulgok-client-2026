import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import {
  confirmMatchingRequest,
  getConfirmedPartnerContact,
  getMatchingErrorMessage,
  sendMatchingRequest,
} from '../../api/matching/matching.js';
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

function getReceiverId(room) {
  return room?.partnerId ? String(room.partnerId) : '';
}

function isDocumentVisible() {
  return typeof document === 'undefined' || document.visibilityState === 'visible';
}

function isFinalConfirmedRoom(room) {
  return room?.matchStatus === 'FINAL_CONFIRMED' || room?.status === 'CLOSED';
}

function isWaitingForPartnerConfirm(room) {
  return room?.matchStatus === 'CONFIRM_PENDING';
}

function canDecideMatch(room) {
  return room?.status === 'OPEN' && room?.matchStatus === 'HEART_MATCHED';
}

function ChatClosedNotice({ contact, contactErrorMessage, isLoadingContact, onShowContact, partnerName }) {
  return (
    <div className="border-t border-[#dce5f1] bg-white px-4 py-4 pb-[max(16px,env(safe-area-inset-bottom))]">
      <div className="rounded-2xl bg-[#edf3fb] px-4 py-3 text-center">
        <p className="text-sm font-extrabold text-fg-primary">최종확정되어 채팅이 종료됐어요.</p>
        {contact ? (
          <div className="mt-3 rounded-xl bg-white/80 px-3 py-2 text-left text-xs font-bold text-fg-primary">
            <div className="flex items-center justify-between gap-3">
              <span className="text-fg-basic-muted">이름</span>
              <span>{contact.partnerName || partnerName}</span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-3">
              <span className="text-fg-basic-muted">전화번호</span>
              <span>{contact.partnerPhoneNumber || '-'}</span>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-xs font-semibold text-fg-basic-muted">
            {isLoadingContact ? '공개된 연락처를 확인하는 중이에요.' : '공개된 연락처로 이후 일정을 조율해 주세요.'}
          </p>
        )}
        {contactErrorMessage && (
          <p className="mt-2 text-xs font-bold text-[#a83f57]">{contactErrorMessage}</p>
        )}
        {contact && (
          <button
            type="button"
            className="mt-3 min-h-9 rounded-full bg-brand-primary px-4 text-xs font-extrabold text-white"
            onClick={onShowContact}
          >
            연락처 크게 보기
          </button>
        )}
      </div>
    </div>
  );
}

function ChatWaitingNotice() {
  return (
    <div className="border-t border-[#dce5f1] bg-white px-4 py-4 pb-[max(16px,env(safe-area-inset-bottom))]">
      <div className="rounded-2xl bg-[#fff7df] px-4 py-3 text-center">
        <p className="text-sm font-extrabold text-fg-primary">상대방 확정 대기중이에요.</p>
        <p className="mt-1 text-xs font-semibold text-[#8b6200]">
          상대방도 최종확정을 완료하면 연락처가 공개됩니다.
        </p>
      </div>
    </div>
  );
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
  const [confirmModalStep, setConfirmModalStep] = useState('');
  const [confirmedContact, setConfirmedContact] = useState(null);
  const [confirmErrorMessage, setConfirmErrorMessage] = useState('');
  const [isConfirmingMatch, setIsConfirmingMatch] = useState(false);
  const [isLoadingContact, setIsLoadingContact] = useState(false);
  const [contactErrorMessage, setContactErrorMessage] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isRejectingMatch, setIsRejectingMatch] = useState(false);
  const [rejectErrorMessage, setRejectErrorMessage] = useState('');

  const readTimerRef = useRef(null);
  const contactRequestKeyRef = useRef('');

  const markRoomAsReadSoon = useCallback(() => {
    if (!currentUserId || isFinalConfirmedRoom(room) || !isDocumentVisible()) return;

    window.clearTimeout(readTimerRef.current);
    readTimerRef.current = window.setTimeout(() => {
      if (!isDocumentVisible()) return;

      markChatMessagesAsRead(roomId)
        .then(() => {
          setMessages((currentMessages) => markIncomingMessagesAsRead(currentMessages, currentUserId));
          return refreshTotalUnreadCount();
        })
        .catch((error) => {
          console.info('메시지 읽음 처리를 완료하지 못했습니다.', error);
        });
    }, 1200);
  }, [currentUserId, refreshTotalUnreadCount, room, roomId]);

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

        const [loadedRoom, messageResult] = await Promise.all([
          getChatRooms().then((rooms) => {
            const fetchedRoom = rooms.find((item) => item.roomId === roomId) ?? null;
            return fetchedRoom && passedRoom ? { ...passedRoom, ...fetchedRoom } : fetchedRoom;
          }),
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
    if (!room || !currentUserId || isFinalConfirmedRoom(room) || !isDocumentVisible()) return;
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

      if (String(payload.senderId) !== String(currentUserId)) {
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
      if (isFinalConfirmedRoom(room) || !isDocumentVisible()) return;

      syncLatestMessages().catch((error) => {
        console.info('메시지 읽음 상태를 동기화하지 못했습니다.', error);
      });
    }, 30000);

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

  const handleOpenFinalConfirm = useCallback(() => {
    setConfirmedContact(null);
    setConfirmErrorMessage('');
    setConfirmModalStep('guide');
  }, []);

  const handleOpenRejectConfirm = useCallback(() => {
    setRejectErrorMessage('');
    setIsRejectModalOpen(true);
  }, []);

  const handleCloseRejectConfirm = useCallback(() => {
    if (isRejectingMatch) return;

    setIsRejectModalOpen(false);
    setRejectErrorMessage('');
  }, [isRejectingMatch]);

  const handleCloseFinalConfirm = useCallback(() => {
    if (isConfirmingMatch) return;

    setConfirmModalStep('');
    setConfirmErrorMessage('');
  }, [isConfirmingMatch]);

  const loadConfirmedContact = useCallback(async (receiverId, { openModal = false } = {}) => {
    setIsLoadingContact(true);
    setContactErrorMessage('');

    const contact = await getConfirmedPartnerContact(receiverId);
    setConfirmedContact(contact);
    if (openModal) setConfirmModalStep('contact');
    setRoom((currentRoom) => (currentRoom
      ? {
          ...currentRoom,
          matchStatus: 'FINAL_CONFIRMED',
          status: 'CLOSED',
        }
      : currentRoom));

    setIsLoadingContact(false);
    return contact;
  }, []);

  const showConfirmedContact = useCallback(async (receiverId) => {
    try {
      await loadConfirmedContact(receiverId, { openModal: true });
    } catch (error) {
      setIsLoadingContact(false);
      throw error;
    }
  }, [loadConfirmedContact]);

  const handleFinalConfirm = useCallback(async () => {
    const receiverId = getReceiverId(room);

    if (!receiverId) {
      setConfirmErrorMessage('상대방 정보를 확인하지 못했어요. 채팅방 목록을 새로고침한 뒤 다시 시도해 주세요.');
      return;
    }

    try {
      setIsConfirmingMatch(true);
      setConfirmErrorMessage('');

      await confirmMatchingRequest(receiverId);

      await showConfirmedContact(receiverId);
    } catch (error) {
      if (error?.response?.status === 403) {
        setConfirmErrorMessage('상대방도 최종확정을 완료하면 연락처가 공개됩니다.');
        setConfirmModalStep('waiting');
        return;
      }

      if (error?.response?.status === 409) {
        try {
          await showConfirmedContact(receiverId);
          return;
        } catch (contactError) {
          if (contactError?.response?.status === 403) {
            setConfirmErrorMessage('상대방도 최종확정을 완료하면 연락처가 공개됩니다.');
            setConfirmModalStep('waiting');
            return;
          }
        }
      }

      setConfirmErrorMessage(getMatchingErrorMessage(error, '최종확정을 완료하지 못했어요.'));
    } finally {
      setIsConfirmingMatch(false);
    }
  }, [room, showConfirmedContact]);

  useEffect(() => {
    const receiverId = getReceiverId(room);
    if (!isFinalConfirmedRoom(room) || !receiverId || confirmedContact) return undefined;

    const requestKey = `${roomId}:${receiverId}`;
    if (contactRequestKeyRef.current === requestKey) return undefined;

    contactRequestKeyRef.current = requestKey;

    let isActive = true;
    const contactTimer = window.setTimeout(() => {
      if (!isActive) return;

      setIsLoadingContact(true);
      setContactErrorMessage('');

      getConfirmedPartnerContact(receiverId)
        .then((contact) => {
          if (isActive) setConfirmedContact(contact);
        })
        .catch((error) => {
          if (isActive) {
            contactRequestKeyRef.current = '';
            setContactErrorMessage(getMatchingErrorMessage(error, '연락처를 불러오지 못했어요.'));
          }
        })
        .finally(() => {
          if (isActive) setIsLoadingContact(false);
        });
    }, 0);

    return () => {
      isActive = false;
      window.clearTimeout(contactTimer);
    };
  }, [confirmedContact, room, roomId]);

  const handleShowContact = useCallback(() => {
    setConfirmErrorMessage('');
    setConfirmModalStep('contact');
  }, []);

  const handleRejectMatch = useCallback(async () => {
    const receiverId = getReceiverId(room);

    if (!receiverId) {
      setRejectErrorMessage('상대방 정보를 확인하지 못했어요. 채팅방 목록을 새로고침한 뒤 다시 시도해 주세요.');
      return;
    }

    try {
      setIsRejectingMatch(true);
      setRejectErrorMessage('');

      await sendMatchingRequest(receiverId, 'REJECT');
      setRoom((currentRoom) => (currentRoom
        ? {
            ...currentRoom,
            matchStatus: 'CLOSED',
            status: 'CLOSED',
          }
        : currentRoom));
      setIsRejectModalOpen(false);
      setSendNotice('상대방을 거절했어요. 채팅이 종료됩니다.');
    } catch (error) {
      setRejectErrorMessage(getMatchingErrorMessage(error, '거절 요청을 처리하지 못했어요.'));
    } finally {
      setIsRejectingMatch(false);
    }
  }, [room]);


  const matchInformation = useMemo(() => {
    if (!room?.matchedAt) return '';
    const percentage = room.matchPercentage != null ? ` · ${room.matchPercentage}% 일치` : '';
    return `${formatMatchedDate(room.matchedAt)}에 서로 매칭되었어요${percentage}`;
  }, [room]);

  const shouldShowDecisionActions = canDecideMatch(room);
  const shouldShowWaitingNotice = isWaitingForPartnerConfirm(room);
  const shouldShowClosedNotice = isFinalConfirmedRoom(room);
  const isInputDisabled = shouldShowClosedNotice || shouldShowWaitingNotice || !isConnected;

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
        matchStatus={room.matchStatus}
        onFinalConfirm={shouldShowDecisionActions ? handleOpenFinalConfirm : undefined}
        onReject={shouldShowDecisionActions ? handleOpenRejectConfirm : undefined}
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
      {shouldShowClosedNotice ? (
        <ChatClosedNotice
          contact={confirmedContact}
          contactErrorMessage={contactErrorMessage}
          isLoadingContact={isLoadingContact}
          onShowContact={handleShowContact}
          partnerName={room.partnerName}
        />
      ) : shouldShowWaitingNotice ? (
        <ChatWaitingNotice />
      ) : (
        <MessageInput
          disabled={isInputDisabled}
          disabledReason="채팅 서버에 연결 중이에요."
          onSend={handleSend}
        />
      )}

      {confirmModalStep && (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-[#172238]/35 p-4 backdrop-blur-[2px] sm:items-center"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) handleCloseFinalConfirm();
          }}
        >
          <div
            className="w-full max-w-[420px] rounded-lg bg-white p-5 shadow-[0_24px_60px_rgba(23,34,56,0.24)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="final-confirm-title"
          >
            {confirmModalStep === 'guide' && (
              <>
                <h2 id="final-confirm-title" className="text-lg font-extrabold text-fg-primary">
                  최종확정 전에 확인해 주세요
                </h2>
                <p className="mt-3 text-sm leading-6 text-fg-basic-muted">
                  최종확정 후 두 사람이 모두 확정하면 서로의 이름과 전화번호가 공개돼요. 실제 기숙사 룸메이트 신청은 학교 안내에 따라 별도 구글폼으로 진행해야 합니다.
                </p>
                {confirmErrorMessage && (
                  <p className="mt-3 rounded-lg bg-[#fff1f3] px-3 py-2 text-xs font-semibold text-[#a83f57]" role="alert">
                    {confirmErrorMessage}
                  </p>
                )}
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="min-h-11 rounded-full bg-[#edf2f8] px-4 text-sm font-extrabold text-fg-primary disabled:opacity-60"
                    disabled={isConfirmingMatch}
                    onClick={handleCloseFinalConfirm}
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    className="min-h-11 rounded-full bg-brand-primary px-4 text-sm font-extrabold text-white disabled:cursor-wait disabled:opacity-60"
                    disabled={isConfirmingMatch}
                    onClick={handleFinalConfirm}
                  >
                    {isConfirmingMatch ? '확정 중' : '최종확정'}
                  </button>
                </div>
              </>
            )}

            {confirmModalStep === 'waiting' && (
              <>
                <h2 id="final-confirm-title" className="text-lg font-extrabold text-fg-primary">
                  상대방 확정 대기중
                </h2>
                <p className="mt-3 text-sm leading-6 text-fg-basic-muted">
                  내 최종확정은 완료됐어요. 상대방도 최종확정을 완료하면 연락처가 공개됩니다.
                </p>
                {confirmErrorMessage && (
                  <p className="mt-3 rounded-lg bg-[#fff7df] px-3 py-2 text-xs font-semibold text-[#8b6200]">
                    {confirmErrorMessage}
                  </p>
                )}
                <button
                  type="button"
                  className="mt-5 min-h-11 w-full rounded-full bg-brand-primary px-4 text-sm font-extrabold text-white"
                  onClick={handleCloseFinalConfirm}
                >
                  확인
                </button>
              </>
            )}

            {confirmModalStep === 'contact' && (
              <>
                <h2 id="final-confirm-title" className="text-lg font-extrabold text-fg-primary">
                  최종확정이 완료됐어요
                </h2>
                <p className="mt-3 text-sm leading-6 text-fg-basic-muted">
                  아래 연락처로 서로 확인한 뒤, 기숙사 룸메이트 신청은 별도 구글폼으로 꼭 진행해 주세요.
                </p>
                <dl className="mt-4 rounded-lg bg-[#f5f8fc] px-4 py-3 text-sm">
                  <div className="flex justify-between gap-4 py-1">
                    <dt className="font-bold text-fg-basic-muted">이름</dt>
                    <dd className="font-extrabold text-fg-primary">{confirmedContact?.partnerName || room.partnerName}</dd>
                  </div>
                  <div className="flex justify-between gap-4 py-1">
                    <dt className="font-bold text-fg-basic-muted">전화번호</dt>
                    <dd className="font-extrabold text-fg-primary">{confirmedContact?.partnerPhoneNumber || '-'}</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  className="mt-5 min-h-11 w-full rounded-full bg-brand-primary px-4 text-sm font-extrabold text-white"
                  onClick={handleCloseFinalConfirm}
                >
                  확인
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {isRejectModalOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-[#172238]/35 p-4 backdrop-blur-[2px] sm:items-center"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) handleCloseRejectConfirm();
          }}
        >
          <div
            className="w-full max-w-[420px] rounded-lg bg-white p-5 shadow-[0_24px_60px_rgba(23,34,56,0.24)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reject-match-title"
          >
            <h2 id="reject-match-title" className="text-lg font-extrabold text-fg-primary">
              상대방을 거절할까요?
            </h2>
            <p className="mt-3 text-sm leading-6 text-fg-basic-muted">
              거절하면 이 채팅방은 종료되고 더 이상 메시지를 보낼 수 없어요.
            </p>
            {rejectErrorMessage && (
              <p className="mt-3 rounded-lg bg-[#fff1f3] px-3 py-2 text-xs font-semibold text-[#a83f57]" role="alert">
                {rejectErrorMessage}
              </p>
            )}
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="min-h-11 rounded-full bg-[#edf2f8] px-4 text-sm font-extrabold text-fg-primary disabled:opacity-60"
                disabled={isRejectingMatch}
                onClick={handleCloseRejectConfirm}
              >
                취소
              </button>
              <button
                type="button"
                className="min-h-11 rounded-full bg-[#c21f4b] px-4 text-sm font-extrabold text-white disabled:cursor-wait disabled:opacity-60"
                disabled={isRejectingMatch}
                onClick={handleRejectMatch}
              >
                {isRejectingMatch ? '처리 중' : '거절'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ChatRoom;
