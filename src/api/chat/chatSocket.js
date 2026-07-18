const socketBaseUrl = import.meta.env.VITE_API_BASE_URL;

function getAccessToken() {
  return localStorage.getItem('accessToken');
}

async function loadSocketDependencies() {
  if (!globalThis.global) {
    globalThis.global = globalThis;
  }

  const [{ Client }, sockJsModule] = await Promise.all([
    import('@stomp/stompjs'),
    import('sockjs-client'),
  ]);

  return {
    Client,
    SockJS: sockJsModule.default,
  };
}

export async function createChatStompClient({ onConnect, onError, onDisconnect } = {}) {
  const accessToken = getAccessToken();
  const { Client, SockJS } = await loadSocketDependencies();

  return new Client({
    webSocketFactory: () => new SockJS(`${socketBaseUrl}/ws/chat`),
    connectHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
    reconnectDelay: 5000,
    onConnect: () => {
      onConnect?.();
    },
    onStompError: (frame) => {
      onError?.(frame);
    },
    onWebSocketError: (event) => {
      onError?.(event);
    },
    onWebSocketClose: (event) => {
      onDisconnect?.(event);
    },
  });
}

export function parseStompBody(message) {
  try {
    return JSON.parse(message.body);
  } catch {
    return null;
  }
}

export function publishChatMessage(client, { roomId, message }) {
  client.publish({
    destination: '/app/chat/send',
    body: JSON.stringify({
      roomId,
      message,
    }),
  });
}
