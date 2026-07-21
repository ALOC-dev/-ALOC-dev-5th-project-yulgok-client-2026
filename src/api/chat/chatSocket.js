import { getAccessToken } from '../../auth/tokenStorage.js';

const socketBaseUrl = import.meta.env.VITE_API_BASE_URL;

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
  const { Client, SockJS } = await loadSocketDependencies();

  const client = new Client({
    webSocketFactory: () => new SockJS(`${socketBaseUrl}/ws/chat`),
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

  client.beforeConnect = async () => {
    const accessToken = getAccessToken();

    client.connectHeaders = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {};
  };

  return client;
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
