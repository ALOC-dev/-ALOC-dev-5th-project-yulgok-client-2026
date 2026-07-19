import { useCallback, useEffect, useState } from 'react';
import { getChatErrorMessage, getChatRooms } from '../../api/chat/chat.js';
import { chatNotificationEventName } from './chatNotificationEvents.js';
import ChatList from './components/ChatList.jsx';

function Chat() {
  const [chatRooms, setChatRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadChatRooms = useCallback(async ({ showLoading = false } = {}) => {
    try {
      if (showLoading) setIsLoading(true);
      setErrorMessage('');
      const rooms = await getChatRooms();
      setChatRooms(rooms);
    } catch (error) {
      console.error('채팅방 목록을 불러오지 못했습니다.', error);
      setErrorMessage(getChatErrorMessage(error, '채팅방 목록을 불러오지 못했어요.'));
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialChatRooms() {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const rooms = await getChatRooms();

        if (isMounted) {
          setChatRooms(rooms);
        }
      } catch (error) {
        console.error('채팅방 목록을 불러오지 못했습니다.', error);

        if (isMounted) {
          setErrorMessage(getChatErrorMessage(error, '채팅방 목록을 불러오지 못했어요.'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialChatRooms();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function handleChatNotification() {
      loadChatRooms();
    }

    window.addEventListener(chatNotificationEventName, handleChatNotification);
    return () => {
      window.removeEventListener(chatNotificationEventName, handleChatNotification);
    };
  }, [loadChatRooms]);

  return (
    <section className="flex min-h-[calc(100dvh-96px)] flex-col px-5 pb-10 pt-5">
      <header className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="font-heading text-lg font-extrabold text-fg-primary">채팅</h1>
          <p className="font-heading text-xs text-fg-basic-muted">서로 하트를 보낸 유저와 채팅할 수 있어요.</p>
        </div>
      </header>

      <main className="mt-3">
        {isLoading && (
          <p className="py-20 text-center text-sm text-fg-basic-muted" role="status">
            채팅방을 불러오는 중이에요...
          </p>
        )}

        {!isLoading && errorMessage && (
          <p className="py-20 text-center text-sm text-fg-basic-muted" role="alert">
            {errorMessage}
          </p>
        )}

        {!isLoading && !errorMessage && chatRooms.length === 0 && (
          <p className="py-20 text-center text-sm text-fg-basic-muted">아직 만들어진 채팅방이 없어요.</p>
        )}

        {!isLoading && !errorMessage && chatRooms.length > 0 && <ChatList chatRooms={chatRooms} />}
      </main>
    </section>
  );
}

export default Chat;
